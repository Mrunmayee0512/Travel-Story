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
      command: ['sh', '-c', 'sleep infinity']
      tty: true
      securityContext:
        runAsUser: 0
      env:
        - name: KUBECONFIG
          value: /kube/kubeconfig
      volumeMounts:
        - mountPath: /kube/kubeconfig
          name: kubeconfig-secret
          subPath: kubeconfig

    - name: dind
      image: docker:dind
      args:
        - "--storage-driver=overlay2"
        - "--insecure-registry=10.0.0.50:30085"
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

        stage('Frontend Build') {
            steps {
                container('node') {
                    dir('frontend') {
                        sh '''
                            npm cache clean --force
                            rm -rf node_modules package-lock.json
                            npm install --legacy-peer-deps
                            npm install -g vite
                            npm run build
                        '''
                    }
                }
            }
        }

        stage('Backend Install') {
            steps {
                container('node') {
                    dir('backend') {
                        sh 'npm install'
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                container('dind') {
                    sh '''
                        sleep 10
                        docker build -t travelstory-frontend:latest ./frontend
                        docker build -t travelstory-backend:latest ./backend
                    '''
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                    dir('backend') {
                        sh '''
                            sonar-scanner \
                              -Dsonar.projectKey=Travel-Story \
                              -Dsonar.sources=. \
                              -Dsonar.host.url=http://my-sonarqube-sonarqube.sonarqube.svc.cluster.local:9000 \
                              -Dsonar.login=sqp_e560b77af3bf5fad79d2f9fb6e0ee105eff2bc41
                        '''
                    }
                }
            }
        }

        stage('Login to Nexus Registry') {
            steps {
                container('dind') {
                    sh '''
                        docker login 10.0.0.50:30085 -u student -p Imcc@2025
                    '''
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                container('dind') {
                    sh '''
                        docker tag travelstory-frontend:latest 10.0.0.50:30085/2401149/travelstory-frontend:v1
                        docker push 10.0.0.50:30085/2401149/travelstory-frontend:v1

                        docker tag travelstory-backend:latest 10.0.0.50:30085/2401149/travelstory-backend:v1
                        docker push 10.0.0.50:30085/2401149/travelstory-backend:v1
                    '''
                }
            }
        }

        stage('Create Secrets') {
            steps {
                container('kubectl') {
                    sh '''
                        kubectl create ns 2401149 --dry-run=client -o yaml | kubectl apply -f -

                        kubectl create secret docker-registry nexus-credentials \
                        --docker-server=10.0.0.50:30085 \
                        --docker-username=student \
                        --docker-password=Imcc@2025 \
                        --docker-email=student@example.com \
                        -n 2401149 --dry-run=client -o yaml | kubectl apply -f -

                        kubectl create secret generic travelstory-secret \
                          -n 2401149 \
                          --from-literal=mongo_url="mongodb+srv://pandemrunmayee0512:MPande0512@travelstory.5hwfd.mongodb.net/?retryWrites=true&w=majority&appName=travelstory" \
                          --from-literal=jwt_secret="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
                          --dry-run=client -o yaml | kubectl apply -f -
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    sh '''
                        kubectl apply -f k8s/deployment.yaml -n 2401149
                        kubectl apply -f k8s/service-ingress.yaml -n 2401149

                        kubectl rollout status deployment/travelstory-deployment -n 2401149 --timeout=300s || echo "Rollout may be delayed"

                        kubectl get pods -n 2401149
                        kubectl get svc -n 2401149
                        kubectl get ingress -n 2401149
                    '''
                }
            }
        }
    }
}
