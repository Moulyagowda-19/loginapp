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
                '''
            }
        }

        stage('Verify MongoDB') {
            steps {
                script {
                    def retries = 10
                    def success = false
                    for (int i = 0; i < retries; i++) {
                        if (sh(script: "docker exec loginapp-mongo-1 mongosh --eval 'db.runCommand({ ping: 1 })' > /dev/null 2>&1", returnStatus: true) == 0) {
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
    }

    post {
        always {
            echo "🎉 Pipeline finished!"
        }
    }
}

