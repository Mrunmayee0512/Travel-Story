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
    volumeMounts:
    - name: workspace-volume
      mountPath: /home/jenkins/agent

  - name: sonar-scanner
    image: sonarsource/sonar-scanner-cli
    command: ['cat']
    tty: true
    volumeMounts:
    - name: workspace-volume
      mountPath: /home/jenkins/agent

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
    - name: workspace-volume
      mountPath: /home/jenkins/agent

  - name: dind
    image: docker:dind
    securityContext:
      privileged: true
    args:
    - "--storage-driver=overlay2"
    - "--insecure-registry=nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085"
    env:
    - name: DOCKER_TLS_CERTDIR
      value: ""
    volumeMounts:
    - name: docker-graph-storage
      mountPath: /var/lib/docker
    - name: workspace-volume
      mountPath: /home/jenkins/agent

  volumes:
  - name: kubeconfig-secret
    secret:
      secretName: kubeconfig-secret
  - name: workspace-volume
    emptyDir: {}
  - name: docker-graph-storage
    emptyDir: {}
'''
        }
    }

    environment {
        NEXUS_REGISTRY = "nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085"
        APP_NAMESPACE  = "2401149"

        FRONTEND_IMAGE = "${NEXUS_REGISTRY}/mpanderepo/travelstory-frontend:v1"
        BACKEND_IMAGE  = "${NEXUS_REGISTRY}/mpanderepo/travelstory-backend:v1"

        NODE_BASE      = "node:20"
    }

    stages {

        stage('Install + Build Frontend') {
            steps {
                container('node') {
                    dir('frontend') {
                        sh '''
                            npm ci
                            npm run build
                        '''
                    }
                }
            }
        }

        stage('Install Backend Packages') {
            steps {
                container('node') {
                    dir('backend') {
                        sh 'npm ci'
                    }
                }
            }
        }

        /* ========= DOCKER BUILD & PUSH FIXED ========= */
        stage('Build, Tag & Push Docker Images') {
            steps {
                container('dind') {

                    withCredentials([usernamePassword(
                        credentialsId: '719f20f1-cabe-4536-96c0-6c312656e8fe',
                        usernameVariable: 'NEXUS_USER',
                        passwordVariable: 'NEXUS_PASS'
                    )]) {

                        sh '''
                            set -euo pipefail

                            echo "=== Logging into Nexus Registry ==="
                            echo "$NEXUS_PASS" | docker login $NEXUS_REGISTRY -u "$NEXUS_USER" --password-stdin

                            echo "=== Building Frontend Image ==="
                            docker build -t ${FRONTEND_IMAGE} frontend/

                            echo "=== Building Backend Image ==="
                            docker build -t ${BACKEND_IMAGE} backend/

                            echo "=== Pushing Images ==="
                            docker push ${FRONTEND_IMAGE}
                            docker push ${BACKEND_IMAGE}
                        '''
                    }
                }
            }
        }

        /* ========= SONAR FIXED (Removed Hardcoding) ========= */
        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                    withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                        sh '''
                          sonar-scanner \
                            -Dsonar.projectKey=Travel-Story \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=http://sonarqube.imcc.com \
                            -Dsonar.login=$SONAR_TOKEN
                        '''
                    }
                }
            }
        }

        /* ========= DEPLOY ========= */
        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    sh '''
                        set -euo pipefail

                        kubectl get ns ${APP_NAMESPACE} || kubectl create ns ${APP_NAMESPACE}

                        kubectl apply -f k8s/service.yaml -n ${APP_NAMESPACE}
                        kubectl apply -f k8s/deployment.yaml -n ${APP_NAMESPACE}

                        kubectl -n ${APP_NAMESPACE} set image deployment/travelstory-frontend-deployment \
                          travelstory-frontend=${FRONTEND_IMAGE}

                        kubectl -n ${APP_NAMESPACE} set image deployment/travelstory-backend-deployment \
                          travelstory-backend=${BACKEND_IMAGE}

                        kubectl rollout status deployment/travelstory-frontend-deployment -n ${APP_NAMESPACE}
                        kubectl rollout status deployment/travelstory-backend-deployment -n ${APP_NAMESPACE}
                    '''
                }
            }
        }
    }

    post {
        success { echo "Pipeline completed successfully." }
        failure { echo "Pipeline failed — check logs." }
    }
}
