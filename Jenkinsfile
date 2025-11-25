pipeline {
    agent any

    environment {
        NEXUS_REGISTRY = "nexus.imcc.com"
        FRONTEND_IMAGE = "nexus.imcc.com/mpanderepo/travelstory-frontend:v1"
        BACKEND_IMAGE  = "nexus.imcc.com/mpanderepo/travelstory-backend:v1"
        NODE_BASE = "node:18-alpine"
    }

    stages {

        /* ============================
                CHECKOUT
        ============================ */
        stage('Checkout Code') {
            steps {
                git branch: 'main', url: 'https://github.com/Mrunmayee0512/Travel-Story.git'
            }
        }


        /* ============================
              SONARQUBE FIXED STAGE
           (No sonar-scanner needed)
        ============================ */
        stage("SonarQube Analysis") {
            steps {
                withSonarQubeEnv('sonarqube-server') {
                    sh """
                        sonar-scanner \
                          -Dsonar.projectKey=Travel-Story \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=http://sonarqube.imcc.com/ \
                          -Dsonar.login=sqp_e560b77af3bf5fad79d2f9fb6e0ee105eff2bc41
                    """
                }
            }
        }


        /* ============================
               BUILD STAGE
        ============================ */
        stage('Build Project') {
            steps {
                sh "echo 'Building frontend project...'"
            }
        }


        /* ============================
           DOCKER BUILD & PUSH - FIXED
        ============================ */
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
                        docker build -t ${FRONTEND_IMAGE} frontend/

                        echo "=== Build Backend Image ==="
                        docker build -t ${BACKEND_IMAGE} backend/

                        echo "=== Push Images ==="
                        docker push ${FRONTEND_IMAGE}
                        docker push ${BACKEND_IMAGE}
                    '''
                }
            }
        }


        /* ============================
                KUBERNETES DEPLOY
        ============================ */
        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([
                    kubeconfigFile(credentialsId: 'k8s-config')
                ]) {
                    sh '''
                        kubectl apply -f k8s/deployment.yaml
                        kubectl apply -f k8s/service.yaml

                        # Name must match your deployment.yaml
                        kubectl rollout status deployment/travelstory-deployment -n 2401149
                        kubectl rollout status deployment/travelstory-deployment -n 2401149
                    '''
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
