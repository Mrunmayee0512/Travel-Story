// pipeline {
//     agent {
//         kubernetes {
//             yaml '''
// apiVersion: v1
// kind: Pod
// spec:
//   containers:
//     - name: node
//       image: node:20
//       command: ['cat']
//       tty: true

//     - name: sonar-scanner
//       image: sonarsource/sonar-scanner-cli
//       command: ['cat']
//       tty: true

//     - name: kubectl
//       image: bitnami/kubectl:latest
//       command: ['sh', '-c', 'while true; do sleep 20; done']
//       tty: true
//       securityContext:
//         runAsUser: 0
//       env:
//         - name: KUBECONFIG
//           value: /kube/kubeconfig
//       volumeMounts:
//         - mountPath: /kube/kubeconfig
//           name: kubeconfig-secret
//           subPath: kubeconfig

//     - name: dind
//       image: docker:dind
//       args:
//         - "--storage-driver=overlay2"
//         - "--insecure-registry=nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085"
//       securityContext:
//         privileged: true
//       env:
//         - name: DOCKER_TLS_CERTDIR
//           value: ""

//   volumes:
//     - name: kubeconfig-secret
//       secret:
//         secretName: kubeconfig-secret
// '''
//         }
//     }

//     stages {

//         stage('Frontend Build') {
//             steps {
//                 container('node') {
//                     dir('frontend') {
//                         sh '''
//                             set -e
//                             npm cache clean --force
//                             rm -rf node_modules package-lock.json
//                             npm install --legacy-peer-deps
//                             npm install -g vite
//                             npm run build
//                         '''
//                     }
//                 }
//             }
//         }

//         stage('Backend Install') {
//             steps {
//                 container('node') {
//                     dir('backend') {
//                         sh '''
//                             set -e
//                             npm install
//                         '''
//                     }
//                 }
//             }
//         }

//         stage('Build Docker Images') {
//             steps {
//                 container('dind') {
//                     sh '''
//                         set -e
//                         sleep 10
//                         docker build -t travelstory-frontend:latest ./frontend
//                         docker build -t travelstory-backend:latest ./backend
//                     '''
//                 }
//             }
//         }

//         stage('SonarQube Analysis') {
//             steps {
//                 container('sonar-scanner') {
//                     dir('backend') {
//                         sh '''
//                             set -e
//                             sonar-scanner \
//                               -Dsonar.projectKey=Travel-Story \
//                               -Dsonar.sources=. \
//                               -Dsonar.host.url=http://my-sonarqube-sonarqube.sonarqube.svc.cluster.local:9000 \
//                               -Dsonar.login=sqp_e560b77af3bf5fad79d2f9fb6e0ee105eff2bc41
//                         '''
//                     }
//                 }
//             }
//         }

//         stage('Login to Nexus Registry') {
//             steps {
//                 container('dind') {
//                     sh '''
//                         set -e
//                         docker login nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085 \
//                         -u student -p Imcc@2025
//                     '''
//                 }
//             }
//         }

//         stage('Push Docker Images') {
//             steps {
//                 container('dind') {
//                     sh '''
//                         set -e
//                         docker tag travelstory-frontend:latest nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/2401149/travelstory-frontend:v1
//                         docker push nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/2401149/travelstory-frontend:v1

//                         docker tag travelstory-backend:latest nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/2401149/travelstory-backend:v1
//                         docker push nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/2401149/travelstory-backend:v1
//                     '''
//                 }
//             }
//         }

//         stage('Create Secrets') {
//             steps {
//                 container('kubectl') {
//                     sh '''
//                         set -e

//                         echo "Creating docker-registry secret..."
//                         kubectl create secret docker-registry nexus-credentials \
//                           --docker-server=nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085 \
//                           --docker-username=student \
//                           --docker-password=Imcc@2025 \
//                           --docker-email=student@example.com \
//                           -n 2401149 --dry-run=client -o yaml | kubectl apply -f -

//                         echo "Creating application secret..."
//                         kubectl create secret generic travelstory-secret \
//                           -n 2401149 \
//                           --from-literal=mongo_url="mongodb+srv://pandemrunmayee0512:MPande0512@travelstory.5hwfd.mongodb.net/?retryWrites=true&w=majority&appName=travelstory" \
//                           --from-literal=jwt_secret="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
//                           --dry-run=client -o yaml | kubectl apply -f -
//                     '''
//                 }
//             }
//         }

//         stage('Deploy to Kubernetes') {
//             steps {
//                 container('kubectl') {
//                     sh '''
//                         set -e

//                         kubectl get ns 2401149 || kubectl create ns 2401149

//                         kubectl apply -f k8s/deployment.yaml -n 2401149
//                         kubectl apply -f k8s/service.yaml -n 2401149

//                         echo "Waiting for rollout..."
//                         if ! kubectl rollout status deployment/travelstory-deployment -n 2401149 --timeout=300s; then
//                             echo "Rollout failed. Rolling back..."
//                             kubectl rollout undo deployment/travelstory-deployment -n 2401149
//                             kubectl get pods -n 2401149
//                             exit 1
//                         fi

//                         kubectl get pods -n 2401149
//                         kubectl get events -n 2401149 --sort-by=.metadata.creationTimestamp | tail -20
//                     '''
//                 }
//             }
//         }
//     }
// }
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
      command: ['sh', '-c', 'while true; do sleep 20; done']
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
        - "--insecure-registry=nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085"
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
                            set -e
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
                        sh '''
                            set -e
                            npm install
                        '''
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                container('dind') {
                    sh '''
                        set -e
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
                            set -e
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
                        set -e
                        docker login nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085 -u student -p Imcc@2025
                    '''
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                container('dind') {
                    sh '''
                        set -e
                        docker tag travelstory-frontend:latest nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/2401149/travelstory-frontend:v1
                        docker push nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/2401149/travelstory-frontend:v1

                        docker tag travelstory-backend:latest nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/2401149/travelstory-backend:v1
                        docker push nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/2401149/travelstory-backend:v1
                    '''
                }
            }
        }

        stage('Create Secrets') {
            steps {
                container('kubectl') {
                    sh '''
                        set -e

                        # Docker registry secret
                        kubectl create secret docker-registry nexus-credentials \
                          --docker-server=nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085 \
                          --docker-username=student \
                          --docker-password=Imcc@2025 \
                          --docker-email=student@example.com \
                          -n 2401149 --dry-run=client -o yaml | kubectl apply -f -

                        # Application secrets
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
                        set -e

                        kubectl get ns 2401149 || kubectl create ns 2401149

                        # Apply deployment, services, and ingress
                        kubectl apply -f k8s/deployment.yaml -n 2401149
                        kubectl apply -f k8s/service.yaml -n 2401149

                        echo "Waiting for deployment rollout..."
                        if ! kubectl rollout status deployment/travelstory-deployment -n 2401149 --timeout=300s; then
                            echo "Rollout failed. Rolling back..."
                            kubectl rollout undo deployment/travelstory-deployment -n 2401149
                            kubectl get pods -n 2401149
                            exit 1
                        fi

                        kubectl get pods -n 2401149
                        kubectl get events -n 2401149 --sort-by=.metadata.creationTimestamp | tail -20
                    '''
                }
            }
        }
    }
}
