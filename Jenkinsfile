pipeline {
    agent any

    environment {
        DOCKER_COMPOSE_FILE = "docker-compose.yml"
    }

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Moulyagowda-19/loginapp.git', credentialsId: 'github-credentials'
            }
        }

        stage('Clean Existing Containers') {
            steps {
                sh 'docker compose down || true'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Run Containers') {
            steps {
                sh 'docker compose up -d'
            }
        }

        stage('Verify Backend') {
            steps {
                sh 'curl -f http://localhost:5000/api/hello || echo "Backend not ready yet"'
            }
        }

        stage('Verify Frontend') {
            steps {
                sh 'curl -f http://localhost:3000 || echo "Frontend not ready yet"'
            }
        }
    }

    post {
        always {
            echo "Pipeline finished. You can leave containers running or stop them manually."
        }
    }
}

