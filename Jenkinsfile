pipeline {
    agent any

    environment {
        DOCKER_COMPOSE = "docker compose"
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
                    sh "${DOCKER_COMPOSE} down"

                    echo "🚀 Rebuilding and starting containers..."
                    sh "${DOCKER_COMPOSE} up -d --build"

                    echo "📋 Current container status:"
                    sh "${DOCKER_COMPOSE} ps"
                }
            }
        }

        stage('Verify MongoDB') {
            steps {
                script {
                    sh "${DOCKER_COMPOSE} exec -T mongo mongosh --eval db.runCommand({ ping: 1 })"
                    echo "✅ MongoDB is up!"
                }
            }
        }

        stage('Verify Backend') {
            steps {
                script {
                    sh "curl -s http://localhost:5000/api/hello"
                    echo "✅ Backend is up!"
                }
            }
        }

        stage('Verify Frontend') {
            steps {
                script {
                    sh "curl -s http://localhost:3000"
                    echo "✅ Frontend is up!"
                }
            }
        }

        stage('Verify Prometheus') {
            steps {
                script {
                    sh "curl -s http://localhost:9090/-/ready"
                    echo "✅ Prometheus is up!"
                }
            }
        }

        stage('Verify Grafana & Provision Gmail Alerts') {
            steps {
                script {
                    // Wait up to 2 minutes (24 retries × 5s = 120s)
                    def retries = 24
                    def success = false

                    for (int i = 0; i < retries; i++) {
                        def status = sh(
                            script: "docker compose exec -T grafana curl -s -o /tmp/grafana_health.json -w '%{http_code}' http://localhost:3000/api/health || true",
                            returnStdout: true
                        ).trim()

                        if (status == "200") {
                            echo "✅ Grafana is healthy!"
                            sh "cat /tmp/grafana_health.json"
                            success = true
                            break
                        } else {
                            echo "⏳ Grafana not ready yet (status: ${status}), retry $i/${retries}"
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

