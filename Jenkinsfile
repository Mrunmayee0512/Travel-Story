pipeline {
    agent any

    environment {
        SONAR_HOST_URL = "http://sonarqube.imcc.com"
        SONAR_TOKEN = "sqp_e560b77af3bf5fad79d2f9fb6e0ee105eff2bc41"

        NEXUS_REGISTRY = "nexus.imcc.com"
        FRONTEND_IMAGE = "nexus.imcc.com/mpanderepo/travelstory-frontend:v1"
        BACKEND_IMAGE  = "nexus.imcc.com/mpanderepo/travelstory-backend:v1"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Mrunmayee0512/Travel-Story.git'
            }
        }

        stage('SonarQube Analysis') {
            steps {
                sh """
                    sonar-scanner \
                        -Dsonar.projectKey=Travel-Story \
                        -Dsonar.sources=. \
                        -Dsonar.host.url=$SONAR_HOST_URL \
                        -Dsonar.login=$SONAR_TOKEN
                """
            }
        }

        stage('Docker Build (Frontend & Backend)') {
            steps {
                sh '''
                    echo "=== Building FRONTEND image ==="
                    docker build -t ${FRONTEND_IMAGE} frontend/

                    echo "=== Building BACKEND image ==="
                    docker build -t ${BACKEND_IMAGE} backend/
                '''
            }
        }

        stage('Docker Login & Push') {
            steps {
                sh '''
                    echo "=== Docker Login ==="
                    docker login $NEXUS_REGISTRY -u student -p Imcc@2025

                    echo "=== Pushing FRONTEND ==="
                    docker push ${FRONTEND_IMAGE}

                    echo "=== Pushing BACKEND ==="
                    docker push ${BACKEND_IMAGE}
                '''
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                sh '''
                    kubectl apply -f k8s/deployment.yaml
                    kubectl apply -f k8s/service.yaml

                    kubectl rollout status deployment/travelstory-deployment -n 2401149
                '''
            }
        }
    }

    post {
        success {
            echo "Pipeline executed successfully!"
        }
        failure {
            echo "Pipeline failed!"
        }
    }
}
