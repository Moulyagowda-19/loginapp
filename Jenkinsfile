pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    url: 'https://github.com/Moulyagowda-19/loginapp.git'
            }
        }

        stage('Build & Deploy Containers') {
            steps {
                sh '''
                echo "🛑 Stopping old containers..."
                docker compose down || true

                echo "🚀 Rebuilding and starting containers..."
                docker compose up -d --build

                echo "📋 Current container status:"
                docker compose ps
                '''
            }
        }

        stage('Verify MongoDB') {
            steps {
                script {
                    def retries = 10
                    def success = false
                    for (int i = 0; i < retries; i++) {
                        if (sh(script: 'docker compose exec -T mongo mongosh --eval "db.runCommand({ ping: 1 })"', returnStatus: true) == 0) {
                            echo "✅ MongoDB is up!"
                            success = true
                            break
                        } else {
                            echo "⏳ MongoDB not ready yet, retrying in 5s..."
                            sleep 5
                        }
                    }
                    if (!success) {
                        error "❌ MongoDB did not become ready."
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
                        if (sh(script: "curl -s http://localhost:5000/api/hello", returnStatus: true) == 0) {
                            echo "✅ Backend is up!"
                            success = true
                            break
                        } else {
                            echo "⏳ Backend not ready yet, retrying in 5s..."
                            sleep 5
                        }
                    }
                    if (!success) {
                        error "❌ Backend did not become ready."
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
                        if (sh(script: "curl -s http://localhost:3000", returnStatus: true) == 0) {
                            echo "✅ Frontend is up!"
                            success = true
                            break
                        } else {
                            echo "⏳ Frontend not ready yet, retrying in 5s..."
                            sleep 5
                        }
                    }
                    if (!success) {
                        error "❌ Frontend did not become ready."
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
                        if (sh(script: "curl -s http://localhost:9090/-/ready", returnStatus: true) == 0) {
                            echo "✅ Prometheus is up!"
                            success = true
                            break
                        } else {
                            echo "⏳ Prometheus not ready yet, retrying in 5s..."
                            sleep 5
                        }
                    }
                    if (!success) {
                        error "❌ Prometheus did not become ready."
                    }
                }
            }
        }

        stage('Verify Grafana & Provision Slack') {
            steps {
                script {
                    def retries = 10
                    def success = false
                    for (int i = 0; i < retries; i++) {
                        if (sh(script: "curl -s http://localhost:3001/login", returnStatus: true) == 0) {
                            echo "✅ Grafana is up!"
                            success = true
                            break
                        } else {
                            echo "⏳ Grafana not ready yet, retrying in 5s..."
                            sleep 5
                        }
                    }
                    if (!success) {
                        error "❌ Grafana did not become ready."
                    }

                    echo "📦 Copying Slack provisioning file into Grafana container..."
                    sh '''
                    GRAFANA_ID=$(docker ps -qf "name=grafana")
                    docker cp grafana/provisioning/alerting/contact-points.yaml $GRAFANA_ID:/etc/grafana/provisioning/alerting/
                    docker restart $GRAFANA_ID
                    '''
                }
            }
        }
    }

    post {
        always {
            echo "🧹 Cleaning up... Pipeline finished!"
            // comment this line if you want containers to keep running
            // sh 'docker compose down'
        }
    }
}

