package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"os"
	"runtime"
	"strings"
	"time"

	"github.com/gorilla/websocket"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/mem"
)


type AgentMetrics struct {
	Type        string  `json:"type"` // "HEARTBEAT"
	CpuCores    int     `json:"cpuCores"`
	CpuUsage    float64 `json:"cpuUsage"`
	RamTotalMb  uint64  `json:"ramTotalMb"`
	RamUsedMb   uint64  `json:"ramUsedMb"`
	DiskTotalGb uint64  `json:"diskTotalGb"`
	DiskUsedGb  uint64  `json:"diskUsedGb"`
	OsInfo      string  `json:"osInfo"`
	Uptime      uint64  `json:"uptime"`
}

func main() {
	serverURL := flag.String("url", os.Getenv("KRATOS_URL"), "URL du panel (ex: http://localhost:8081)")
	token := flag.String("token", os.Getenv("KRATOS_TOKEN"), "Token de l'agent")
	flag.Parse()

	if *serverURL == "" || *token == "" {
		log.Fatal("Erreur: --url et --token sont obligatoires.")
	}

	wsURL := buildWebSocketURL(*serverURL)
	log.Printf("Démarrage de Kratos-Agent vers %s", wsURL)


	for {
		err := connectAndStream(wsURL, *token)
		if err != nil {
			log.Printf("Connexion perdue (%v). Nouvelle tentative dans 5s...", err)
		}
		time.Sleep(5 * time.Second)
	}
}


func buildWebSocketURL(rawURL string) string {
	u, err := url.Parse(strings.TrimRight(rawURL, "/"))
	if err != nil {
		log.Fatalf("URL invalide : %v", err)
	}
	if u.Scheme == "https" {
		u.Scheme = "wss"
	} else {
		u.Scheme = "ws"
	}
	u.Path = "/api/agent/connect"
	return u.String()
}

func connectAndStream(wsURL, token string) error {
	headers := http.Header{}
	headers.Add("Authorization", "Bearer "+token)

	conn, _, err := websocket.DefaultDialer.Dial(wsURL, headers)
	if err != nil {
		return err
	}
	defer conn.Close()

	log.Println("Connecté avec succès au backend Kratos-Panel !")


	go func() {
		for {
			_, msg, err := conn.ReadMessage()
			if err != nil {
				return
			}
			log.Printf("Ordre reçu du panel : %s", string(msg))
		}
	}()


	if err := sendMetrics(conn); err != nil {
		return err
	}

	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for range ticker.C {
		if err := sendMetrics(conn); err != nil {
			return err
		}
	}
	return nil
}

func sendMetrics(conn *websocket.Conn) error {
	vMem, _ := mem.VirtualMemory()
	dStat, _ := disk.Usage("/")
	hInfo, _ := host.Info()
	cpuPercent, _ := cpu.Percent(0, false)

	var currentCpu float64
	if len(cpuPercent) > 0 {
		currentCpu = cpuPercent[0]
	}

	payload := AgentMetrics{
		Type:        "HEARTBEAT",
		CpuCores:    runtime.NumCPU(),
		CpuUsage:    currentCpu,
		RamTotalMb:  vMem.Total / 1024 / 1024,
		RamUsedMb:   vMem.Used / 1024 / 1024,
		DiskTotalGb: dStat.Total / 1024 / 1024 / 1024,
		DiskUsedGb:  dStat.Used / 1024 / 1024 / 1024,
		OsInfo:      fmt.Sprintf("%s %s (%s)", hInfo.Platform, hInfo.PlatformVersion, hInfo.KernelArch),
		Uptime:      hInfo.Uptime,
	}

	data, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	return conn.WriteMessage(websocket.TextMessage, data)
}
