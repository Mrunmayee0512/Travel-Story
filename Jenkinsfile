pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:

  - name: node
    image: node:20
    command: ['cat']
    tty: true

  - name: sonar-scanner
    image: sonarsource/sonar-scanner-cli
    command: ['cat']
    tty: true

  - name: kubectl
    image: bitnami/kubectl:latest
    command: ['cat']
    tty: true
    env:
    - name: KUBECONFIG
      value: /kube/config
    volumeMounts:
    - name: kubeconfig-secret
      mountPath: /kube/config
      subPath: kubeconfig

  - name: dind
    image: docker:dind
    args: ["--storage-driver=overlay2"]
    securityContext:
      privileged: true
    env:
    - name: DOCKER_TLS_CERTDIR
      value: ""

  volumes:
  - name: kubeconfig-secret
    secret:
      secretName: kubeconfig-secret
'''
        }
    }

    environment {
        NEXUS_REG = "nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085"
        NEXUS_REPO = "${NEXUS_REG}/mpanderepo"
        IMAGE_NAME = "${NEXUS_REPO}/travelstory-frontend"
    }

    stages {

        stage('Check Workspace Structure') {
            steps {
                sh '''
                    echo "===== WORKSPACE CONTENTS ====="
                    ls -la
                    ls -R .
                '''
            }
        }

        stage('Install + Build Frontend') {
            steps {
                container('node') {
                    sh '''
                        set -e
                        cd frontend
                        echo "Node: $(node -v), NPM: $(npm -v)"
                        npm ci --no-audit --no-fund
                        npm run build
                        ls -la dist || ls -la build || true
                    '''
                }
            }
        }

        stage('Docker Login (Nexus)') {
            steps {
                withCredentials([usernamePassword(credentialsId: '719f20f1-cabe-4536-96c0-6c312656e8fe', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
                    container('dind') {
                        sh '''
                            set -e
                            echo "Logging in to Nexus..."
                            docker login ${NEXUS_REG} -u "${NEXUS_USER}" -p "${NEXUS_PASS}"
                        '''
                    }
                }
            }
        }

        stage('Build Docker Image') {
            steps {
                container('dind') {
                    sh '''
                        set -e
                        TAG="${IMAGE_NAME}:${BUILD_NUMBER}"
                        echo "Building Docker Image..."
                        docker build -t "${TAG}" ./frontend
                        docker tag "${TAG}" "${IMAGE_NAME}:latest"
                    '''
                }
            }
        }

        stage('Push to Nexus') {
            steps {
                container('dind') {
                    sh '''
                        set -e
                        TAG="${IMAGE_NAME}:${BUILD_NUMBER}"
                        echo "Pushing images to Nexus..."
                        docker push "${TAG}"
                        docker push "${IMAGE_NAME}:latest"
                    '''
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                    sh '''
                        set -e
                        cd frontend
                        sonar-scanner \
                            -Dsonar.projectKey=Travel-Story \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=http://sonarqube.imcc.com \
                            -Dsonar.login=sqp_e560b77af3bf5fad79d2f9fb6e0ee105eff2bc41q
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    sh '''
                        set -e
                        kubectl set image deployment/travelstory-deployment travelstory-container=${IMAGE_NAME}:latest -n 2401149 || true
                        kubectl apply -f k8s/deployment.yaml -n 2401149
                        kubectl apply -f k8s/service.yaml -n 2401149
                        kubectl rollout status deployment/travelstory-deployment -n 2401149
                    '''
                }
            }
        }
    }

    post {
        always {
            echo "Cleaning workspace..."
            cleanWs()
        }
        success {
            echo "Pipeline completed successfully!"
        }
        failure {
            echo "Pipeline failed."
        }
    }
}
