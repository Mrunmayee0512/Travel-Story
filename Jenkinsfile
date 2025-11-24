pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:

  - name: node
    image: node:18
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

    stages {

        /* --------------------- DEBUG WORKSPACE --------------------- */
        stage('Check Workspace Structure') {
            steps {
                sh '''
                    echo "===== WORKSPACE CONTENTS ====="
                    ls -R .
                '''
            }
        }

        /* --------------------- FIX SPARSE CHECKOUT --------------------- */
        stage('Fix Sparse Checkout') {
            steps {
                sh '''
                    echo "Disabling sparse checkout if enabled..."
                    git config core.sparsecheckout false || true
                    git checkout .
                '''
            }
        }

        /* --------------------- FRONTEND BUILD --------------------- */
        stage('Install + Build Frontend') {
            steps {
                container('node') {
                    sh '''
                        cd travelstory-frontend
                        npm install
                        npm run build
                    '''
                }
            }
        }

        /* --------------------- DOCKER BUILD --------------------- */
        stage('Build Docker Image') {
            steps {
                container('dind') {
                    sh '''
                        sleep 10
                        docker build -t travelstory-frontend:latest ./travelstory-frontend
                    '''
                }
            }
        }

        /* --------------------- SONAR SCAN --------------------- */
        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                    sh '''
                        cd travelstory-frontend
                        sonar-scanner \
                            -Dsonar.projectKey=Travel-Story \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=http://sonarqube.imcc.com/ \
                            -Dsonar.login=sqp_e560b77af3bf5fad79d2f9fb6e0ee105eff2bc41q
                    '''
                }
            }
        }

        /* --------------------- NEXUS LOGIN --------------------- */
        stage('Login to Nexus Registry') {
            steps {
                container('dind') {
                    sh '''
                        docker login nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085 \
                            -u admin -p Changeme@2025
                    '''
                }
            }
        }

        /* --------------------- PUSH IMAGE --------------------- */
        stage('Push to Nexus') {
            steps {
                container('dind') {
                    sh '''
                        docker tag travelstory-frontend:latest \
                            nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/mpanderepo/travelstory-frontend:v1

                        docker push \
                            nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/mpanderepo/travelstory-frontend:v1
                    '''
                }
            }
        }

        /* --------------------- DEPLOY TO K8s --------------------- */
        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    sh '''
                        kubectl apply -f k8s/deployment.yaml -n 2401149
                        kubectl apply -f k8s/service.yaml -n 2401149

                        kubectl rollout status deployment/travelstory-deployment -n 2401149
                    '''
                }
            }
        }
    }
}
