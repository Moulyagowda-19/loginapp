pipeline {
    agent any

    stages {
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Moulyagowda-19/loginapp.git'
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker-compose build'
            }
        }

        stage('Run Containers') {
            steps {
                sh 'docker-compose up -d'
            }
        }

        stage('Verify Backend') {
            steps {
                sh 'curl -f http://localhost:5000/api/hello || exit 1'
            }
        }

        stage('Verify Frontend') {
            steps {
                sh 'curl -f http://localhost:3000 || exit 1'
            }
        }
    }

    post {
        always {
            sh 'docker-compose down'
        }
    }
}
