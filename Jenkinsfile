pipeline {
    agent any

    environment {
        NEXUS_REGISTRY = "nexus.imcc.com"
        FRONTEND_IMAGE = "nexus.imcc.com/mpanderepo/travelstory-frontend:v1"
        BACKEND_IMAGE  = "nexus.imcc.com/mpanderepo/travelstory-backend:v1"
        NODE_BASE = "node:18-alpine"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Mrunmayee0512/Travel-Story.git'
            }
        }

        stage("SonarQube Analysis") {
            steps {
                withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                    script {
                        sh """
                            sonar-scanner \
                              -Dsonar.projectKey=travelstory \
                              -Dsonar.sources=. \
                              -Dsonar.host.url=http://sonarqube.imcc.com/ \
                              -Dsonar.login=sqp_e560b77af3bf5fad79d2f9fb6e0ee105eff2bc41
                        """
                    }
                }
            }
        }

        stage('Build Project') {
            steps {
                sh "echo 'Building frontend project...'"
            }
        }

        stage('Docker Build & Push') {
            steps {
                withCredentials([
                    usernamePassword(
                        credentialsId: '719f20f1-cabe-4536-96c0-6c312656e8fe',
                        usernameVariable: 'NEXUS_USER',
                        passwordVariable: 'NEXUS_PASS'
                    )
                ]) {
                    sh '''
                        echo "=== Docker Login to Nexus ==="
                        echo "$NEXUS_PASS" | docker login $NEXUS_REGISTRY -u "$NEXUS_USER" --password-stdin

                        echo "=== Build Frontend Image ==="
                        docker build --build-arg NODE_IMAGE=${NODE_BASE} -t ${FRONTEND_IMAGE} frontend/

                        echo "=== Build Backend Image ==="
                        docker build --build-arg NODE_IMAGE=${NODE_BASE} -t ${BACKEND_IMAGE} backend/

                        echo "=== Push Frontend Image ==="
                        docker push ${FRONTEND_IMAGE}

                        echo "=== Push Backend Image ==="
                        docker push ${BACKEND_IMAGE}
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    withCredentials([
                        kubeconfigFile(credentialsId: 'k8s-config')
                    ]) {
                        sh '''
                            kubectl apply -f k8s/deployment.yaml
                            kubectl apply -f k8s/service.yaml

                            kubectl rollout status deployment/travelstory-deployment -n 2401149
                        '''
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline executed successfully!!"
        }
        failure {
            echo "Pipeline failed. Check logs."
        }
    }
}
