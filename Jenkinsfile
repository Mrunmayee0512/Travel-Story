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
    command: ['sh', '-c', 'while true; do sleep 30; done']
    tty: true
    volumeMounts:
    - mountPath: /home/jenkins/agent
      name: workspace-volume

  - name: sonar-scanner
    image: sonarsource/sonar-scanner-cli
    command: ['sh', '-c', 'while true; do sleep 30; done']
    tty: true
    volumeMounts:
    - mountPath: /home/jenkins/agent
      name: workspace-volume

  - name: kubectl
    image: bitnami/kubectl:latest
    command: ['sh', '-c', 'while true; do sleep 30; done']
    tty: true
    env:
    - name: KUBECONFIG
      value: /kube/kubeconfig
    volumeMounts:
    - name: kubeconfig-secret
      mountPath: /kube
    - mountPath: /home/jenkins/agent
      name: workspace-volume

  - name: dind
    image: docker:dind
    securityContext:
      privileged: true
    command: ['sh', '-c', 'while true; do sleep 30; done']
    tty: true
    args:
      - "--storage-driver=overlay2"
      - "--insecure-registry=nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085"
    env:
    - name: DOCKER_TLS_CERTDIR
      value: ""
    volumeMounts:
    - mountPath: /home/jenkins/agent
      name: workspace-volume

  - name: jnlp
    image: jenkins/inbound-agent:3309.v27b_9314fd1a_4-1
    env:
    - name: JENKINS_AGENT_WORKDIR
      value: "/home/jenkins/agent"
    volumeMounts:
    - mountPath: "/home/jenkins/agent"
      name: workspace-volume

  volumes:
  - name: workspace-volume
    emptyDir: {}
  - name: kubeconfig-secret
    secret:
      secretName: kubeconfig-secret
'''
        }
    }

    environment {
        REGISTRY = "nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085"
        REPO = "mpanderepo"
    }

    stages {

        stage('Install + Build Frontend') {
            steps {
                container('node') {
                    dir('frontend') {
                        sh '''
                            npm install
                            npm run build
                        '''
                    }
                }
            }
        }

        stage('Install Backend Dependencies') {
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
                        docker login ${REGISTRY} -u student -p Imcc@2025
                    '''
                }
            }
        }

        stage('Tag + Push Images') {
            steps {
                container('dind') {
                    sh '''
                        docker tag travelstory-frontend:latest ${REGISTRY}/${REPO}/travelstory-frontend:${BUILD_NUMBER}
                        docker push ${REGISTRY}/${REPO}/travelstory-frontend:${BUILD_NUMBER}

                        docker tag travelstory-backend:latest ${REGISTRY}/${REPO}/travelstory-backend:${BUILD_NUMBER}
                        docker push ${REGISTRY}/${REPO}/travelstory-backend:${BUILD_NUMBER}
                    '''
                }
            }
        }

        stage('Create Namespace + Registry Secret') {
            steps {
                container('kubectl') {
                    sh '''
                        # Create namespace if not exists
                        kubectl get namespace 2401149 || kubectl create namespace 2401149

                        # Create/Update image pull secret
                        kubectl create secret docker-registry nexus-secret \
                          --docker-server=${REGISTRY} \
                          --docker-username=student \
                          --docker-password=Imcc@2025 \
                          --namespace=2401149 \
                          --dry-run=client -o yaml > secret.yaml

                        kubectl apply -f secret.yaml
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    dir('k8s') {
                        sh '''
                            sed -i "s|travelstory-frontend:latest|travelstory-frontend:${BUILD_NUMBER}|g" deployment.yaml
                            sed -i "s|travelstory-backend:latest|travelstory-backend:${BUILD_NUMBER}|g" deployment.yaml

                            kubectl apply -f deployment.yaml
                            kubectl apply -f service.yaml

                            kubectl rollout status deployment/travelstory-deployment -n 2401149
                        '''
                    }
                }
            }
        }
    }
}
