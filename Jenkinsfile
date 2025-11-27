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

        stage('Login to Nexus') {
            steps {
                container('dind') {
                    sh '''
                        docker login nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085 \
                          -u admin -p Changeme@2025
                    '''
                }
            }
        }

        stage('Push Docker Images') {
            steps {
                container('dind') {
                    sh '''
                        docker tag travelstory-frontend:latest nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/2401149/travelstory-frontend:v1
                        docker push nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/2401149/travelstory-frontend:v1

                        docker tag travelstory-backend:latest nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/2401149/travelstory-backend:v1
                        docker push nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085/2401149/travelstory-backend:v1
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    sh '''
                        kubectl get ns 2401149 || kubectl create ns 2401149
                        kubectl apply -f k8s/deployment.yaml -n 2401149
                        kubectl apply -f k8s/service.yaml -n 2401149
                        kubectl rollout status deployment/travelstory-deployment -n 2401149 --timeout=120s || echo "Rollout may be delayed due to image pull"
                        kubectl get events -n 2401149 --sort-by=.metadata.creationTimestamp | tail -20
                        kubectl get pods -n 2401149
                    '''
                }
            }
        }
    }
}
