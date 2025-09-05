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
                    echo "🚀 Rebuilding and starting containers (waiting for health)..."
                    sh 'docker compose up -d --build --wait'
                    echo "📋 Current container status:"
                    sh 'docker compose ps'
                }
            }
        }

        stage('Verify Services') {
            parallel {
                stage('Verify MongoDB') {
                    steps {
                        script {
                            echo "⏳ Waiting for MongoDB to be healthy..."
                            int retries = 20
                            int delay = 10
                            for (int i = 0; i < retries; i++) {
                                def status = sh(script: "docker inspect --format='{{json .State.Health.Status}}' mongo || echo 'unknown'", returnStdout: true).trim()
                                echo "MongoDB health: ${status}"
                                if (status == '"healthy"') {
                                    echo "✅ MongoDB is ready!"
                                    break
                                }
                                sleep delay
                                if (i == retries - 1) {
                                    error "❌ MongoDB did not become healthy in time."
                                }
                            }
                        }
                    }
                }

                stage('Verify Backend') {
                    steps {
                        script {
                            waitUntil(initialRecurrencePeriod: 5000) {
                                def status = sh(script: "curl -s -o /tmp/backend_response.txt -w '%{http_code}' http://localhost:5000/api/hello || true", returnStdout: true).trim()
                                return status == '200'
                            }
                            echo "✅ Backend is up!"
                            sh "cat /tmp/backend_response.txt"
                        }
                    }
                }

                stage('Verify Frontend') {
                    steps {
                        script {
                            waitUntil(initialRecurrencePeriod: 5000) {
                                def status = sh(script: "curl -s -o /tmp/frontend_response.html -w '%{http_code}' http://localhost:3000 || true", returnStdout: true).trim()
                                return status == '200'
                            }
                            echo "✅ Frontend is up!"
                        }
                    }
                }

                stage('Verify Prometheus') {
                    steps {
                        script {
                            waitUntil(initialRecurrencePeriod: 5000) {
                                def status = sh(script: "curl -s -o /tmp/prometheus_health.txt -w '%{http_code}' http://localhost:9090/-/ready || true", returnStdout: true).trim()
                                return status == '200'
                            }
                            echo "✅ Prometheus is up!"
                        }
                    }
                }

                stage('Verify Grafana') {
                    steps {
                        script {
                            waitUntil(initialRecurrencePeriod: 5000) {
                                def status = sh(script: "curl -s -o /tmp/grafana_health.json -w '%{http_code}' http://localhost:3001/api/health || true", returnStdout: true).trim()
                                return status == '200'
                            }
                            echo "✅ Grafana is healthy!"
                            sh "cat /tmp/grafana_health.json"
                        }
                    }
                }
            }
        }

        stage('Provision Grafana Alerts') {
            steps {
                script {
                    echo "📦 Copying Gmail provisioning files into Grafana container..."
                    sh '''
                        GRAFANA_ID=$(docker ps -qf "name=grafana")
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

