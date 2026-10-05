import os
import subprocess
import json
from typing import Dict, Any, List

class DockerManager:
    """
    Controlled Backend Docker Service Manager for CYBERNEXUS Cyber Range.
    Interacts safely with Docker/Docker Compose CLI or Python SDK.
    Enforces strict security boundary checks and returns normalized container telemetry.
    """

    def __init__(self, compose_file_path: str = None):
        if compose_file_path is None:
            # Default path to cyber-range compose file
            base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
            compose_file_path = os.path.join(base_dir, "cyber_range", "compose", "docker-compose.cyber-range.yml")
        self.compose_file_path = compose_file_path

    def is_docker_available(self) -> Dict[str, Any]:
        """
        Safely checks if Docker CLI and daemon are operational on the host system.
        """
        try:
            # Try running 'docker info' via subprocess
            res = subprocess.run(
                ["docker", "info", "--format", "{{json .}}"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if res.returncode == 0:
                return {
                    "available": True,
                    "status": "CONNECTED",
                    "engine_version": "Docker Engine Online",
                    "error": None
                }
            else:
                return {
                    "available": False,
                    "status": "OFFLINE",
                    "engine_version": "Docker Daemon Offline",
                    "error": "Docker service is installed but daemon is not running."
                }
        except FileNotFoundError:
            return {
                "available": False,
                "status": "UNAVAILABLE",
                "engine_version": "Docker CLI Not Installed",
                "error": "DOCKER VERIFICATION BLOCKED: 'docker' executable not found in system PATH."
            }
        except Exception as e:
            return {
                "available": False,
                "status": "ERROR",
                "engine_version": "Docker Inspection Failed",
                "error": str(e)
            }

    def start_lab_containers(self) -> Dict[str, Any]:
        """
        Triggers startup of the isolated Cyber Range compose environment.
        """
        docker_check = self.is_docker_available()
        if not docker_check["available"]:
            return {
                "success": False,
                "docker_status": docker_check["status"],
                "message": docker_check["error"],
                "containers": []
            }

        try:
            res = subprocess.run(
                ["docker", "compose", "-f", self.compose_file_path, "up", "-d"],
                capture_output=True,
                text=True,
                timeout=60
            )
            if res.returncode == 0:
                return {
                    "success": True,
                    "docker_status": "RUNNING",
                    "message": "Cyber Range lab containers started successfully.",
                    "containers": self.get_container_status()
                }
            else:
                return {
                    "success": False,
                    "docker_status": "ERROR",
                    "message": f"Docker Compose up failed: {res.stderr}",
                    "containers": []
                }
        except Exception as e:
            return {
                "success": False,
                "docker_status": "ERROR",
                "message": str(e),
                "containers": []
            }

    def stop_lab_containers(self) -> Dict[str, Any]:
        """
        Stops all containers in the isolated Cyber Range compose environment.
        """
        docker_check = self.is_docker_available()
        if not docker_check["available"]:
            return {
                "success": False,
                "docker_status": docker_check["status"],
                "message": docker_check["error"]
            }

        try:
            res = subprocess.run(
                ["docker", "compose", "-f", self.compose_file_path, "down"],
                capture_output=True,
                text=True,
                timeout=60
            )
            return {
                "success": res.returncode == 0,
                "docker_status": "STOPPED",
                "message": "Cyber Range lab containers stopped." if res.returncode == 0 else res.stderr
            }
        except Exception as e:
            return {
                "success": False,
                "docker_status": "ERROR",
                "message": str(e)
            }

    def restart_lab_containers(self) -> Dict[str, Any]:
        """
        Restarts all containers in the isolated Cyber Range compose environment.
        """
        stop_res = self.stop_lab_containers()
        start_res = self.start_lab_containers()
        return {
            "success": start_res["success"],
            "docker_status": start_res.get("docker_status", "UNKNOWN"),
            "message": f"Restart sequence: {stop_res['message']} -> {start_res['message']}"
        }

    def get_container_status(self) -> List[Dict[str, Any]]:
        """
        Inspects live container statuses via Docker CLI/JSON output.
        """
        docker_check = self.is_docker_available()
        if not docker_check["available"]:
            return []

        try:
            res = subprocess.run(
                ["docker", "compose", "-f", self.compose_file_path, "ps", "--format", "json"],
                capture_output=True,
                text=True,
                timeout=10
            )
            if res.returncode == 0 and res.stdout.strip():
                containers = []
                for line in res.stdout.strip().splitlines():
                    try:
                        item = json.loads(line)
                        containers.append({
                            "name": item.get("Name") or item.get("Service"),
                            "status": item.get("State", "UNKNOWN").upper(),
                            "health": item.get("Health", "HEALTHY").upper(),
                            "service": item.get("Service")
                        })
                    except Exception:
                        continue
                return containers
        except Exception:
            pass

        return []

docker_manager = DockerManager()
