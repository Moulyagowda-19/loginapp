pipeline {
    agent any
    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
    }
    stages {

        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Build & Deploy Containers') {
            steps {
                script {
                    echo "🛑 Stopping old containers..."
                    sh 'docker compose down'

                    echo "🚀 Rebuilding and starting containers..."
                    sh 'docker compose up -d --build'

                    echo "📋 Current container status:"
                    sh 'docker compose ps'
                }
            }
        }

        stage('Verify MongoDB') {
            steps {
                script {
                    def retries = 5
                    def success = false
                    for (int i = 0; i < retries; i++) {
                        def result = sh(
                            script: "docker compose exec -T mongo mongosh --eval 'db.runCommand({ ping: 1 })' || true",
                            returnStdout: true
                        ).trim()
                        if (result.contains('"ok" : 1')) {
                            echo "✅ MongoDB is up!"
                            success = true
                            break
                        } else {
                            echo "⏳ MongoDB not ready yet, retry $i/$retries"
                            sleep 5
                        }
                    }
                    if (!success) {
                        error "❌ MongoDB did not become ready in time."
                    }
                }
            }
        }

        stage('Verify Backend') {
            steps {
                script {
                    def retries = 10
                    def success = false
                    for (int i = 0; i < retries; i++) {
                        def status = sh(
                            script: "curl -s -o /tmp/backend_response.txt -w '%{http_code}' http://localhost:5000/api/hello || true",
                            returnStdout: true
                        ).trim()
                        if (status == '200') {
                            echo "✅ Backend is up!"
                            sh "cat /tmp/backend_response.txt"
                            success = true
                            break
                        } else {
                            echo "⏳ Backend not ready yet, retry $i/$retries"
                            sleep 5
                        }
                    }
                    if (!success) {
                        error "❌ Backend did not become ready in time."
                    }
                }
            }
        }

        stage('Verify Frontend') {
            steps {
                script {
                    def retries = 10
                    def success = false
                    for (int i = 0; i < retries; i++) {
                        def status = sh(
                            script: "curl -s -o /tmp/frontend_response.html -w '%{http_code}' http://localhost:3000 || true",
                            returnStdout: true
                        ).trim()
                        if (status == '200') {
                            echo "✅ Frontend is up!"
                            success = true
                            break
                        } else {
                            echo "⏳ Frontend not ready yet, retry $i/$retries"
                            sleep 5
                        }
                    }
                    if (!success) {
                        error "❌ Frontend did not become ready in time."
                    }
                }
            }
        }

        stage('Verify Prometheus') {
            steps {
                script {
                    def retries = 10
                    def success = false
                    for (int i = 0; i < retries; i++) {
                        def status = sh(
                            script: "curl -s -o /tmp/prometheus_health.txt -w '%{http_code}' http://localhost:9090/-/ready || true",
                            returnStdout: true
                        ).trim()
                        if (status == '200') {
                            echo "✅ Prometheus is up!"
                            success = true
                            break
                        } else {
                            echo "⏳ Prometheus not ready yet, retry $i/$retries"
                            sleep 5
                        }
                    }
                    if (!success) {
                        error "❌ Prometheus did not become ready in time."
                    }
                }
            }
        }

        stage('Verify Grafana & Provision Gmail Alerts') {
            steps {
                script {
                    def retries = 24
                    def success = false
                    for (int i = 0; i < retries; i++) {
                        def status = sh(
                            script: "docker compose exec -T grafana curl -s -o /tmp/grafana_health.json -w '%{http_code}' http://localhost:3001/api/health || true",
                            returnStdout: true
                        ).trim()
                        if (status == '200') {
                            echo "✅ Grafana is healthy!"
                            sh "cat /tmp/grafana_health.json"
                            success = true
                            break
                        } else {
                            echo "⏳ Grafana not ready yet (status: ${status}), retry $i/$retries"
                            sleep 5
                        }
                    }
                    if (!success) {
                        error "❌ Grafana did not become ready in time."
                    }

                    echo "📦 Copying Gmail provisioning files into Grafana container..."
                    sh '''
                    GRAFANA_ID=$(docker ps -qf "name=grafana")
                    if [ -z "$GRAFANA_ID" ]; then
                      echo "❌ Grafana container not found!"
                      exit 1
                    fi

                    docker cp grafana/provisioning/alerting/contact-points.yaml $GRAFANA_ID:/etc/grafana/provisioning/alerting/
                    docker cp grafana/provisioning/alerting/alert-rules.yaml $GRAFANA_ID:/etc/grafana/provisioning/alerting/

                    echo "🔄 Restarting Grafana to apply alerting configuration..."
                    docker restart $GRAFANA_ID
                    '''
                }
            }
        }
    }

    post {
        always {
            echo "🧹 Cleaning up... Pipeline finished!"
        }
    }
}

