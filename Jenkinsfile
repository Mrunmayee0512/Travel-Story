pipeline {
    agent {
        kubernetes {
            label "travelstory-build-agent"
            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: node
    image: node:20
    command: ["cat"]
    tty: true
    volumeMounts:
    - name: workspace-volume
      mountPath: /home/jenkins/agent

  - name: sonar-scanner
    image: sonarsource/sonar-scanner-cli
    command: ["cat"]
    tty: true
    volumeMounts:
    - name: workspace-volume
      mountPath: /home/jenkins/agent

  - name: kubectl
    image: bitnami/kubectl:latest
    command: ["cat"]
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
    privileged: true
    args: ["--storage-driver=overlay2"]
    volumeMounts:
    - name: workspace-volume
      mountPath: /home/jenkins/agent

  - name: jnlp
    image: jenkins/inbound-agent:latest
    args: ["\${computer.jnlpmac}", "\${computer.name}"]
    volumeMounts:
    - name: workspace-volume
      mountPath: /home/jenkins/agent

  volumes:
  - name: workspace-volume
    emptyDir: {}
  - name: kubeconfig-secret
    secret:
      secretName: kubeconfig-secret
"""
        }
    }

    environment {
        REGISTRY_URL = "nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085"
        IMAGE_NAME = "travelstory-frontend"
        SONAR_PROJECT_KEY = "TravelStory"
        SONAR_HOST_URL = "http://sonarqube-service.sonarqube.svc.cluster.local:9000"
    }

    stages {

        stage("Check Workspace Structure") {
            steps {
                sh """
                echo ===== WORKSPACE CONTENTS =====
                ls -la
                """
            }
        }

        stage("Install + Build Frontend") {
            steps {
                container('node') {
                    sh """
                    set -e
                    cd frontend
                    npm ci --no-audit --no-fund
                    npm run build
                    ls -la dist
                    """
                }
            }
        }

        stage("Docker Login (Nexus)") {
            steps {
                withCredentials([usernamePassword(credentialsId: '719f20f1-cabe-4536-96c0-6c312656e8fe',
                    usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]){

                    container('dind') {
                        sh """
                        echo Logging in to Nexus...
                        docker login $REGISTRY_URL -u $NEXUS_USER -p $NEXUS_PASS
                        """
                    }
                }
            }
        }

        stage("Build Docker Image") {
            steps {
                container('dind') {
                    sh """
                    docker build -t $REGISTRY_URL/$IMAGE_NAME:v1 ./frontend
                    """
                }
            }
        }

        stage("Push to Nexus") {
            steps {
                container('dind') {
                    sh """
                    docker push $REGISTRY_URL/$IMAGE_NAME:v1
                    """
                }
            }
        }

        stage("SonarQube Analysis") {
            steps {
                container('sonar-scanner') {
                    withCredentials([string(credentialsId: 'sonar-token', variable: 'SONAR_TOKEN')]) {
                        sh """
                        sonar-scanner \
                          -Dsonar.projectKey=$SONAR_PROJECT_KEY \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=$SONAR_HOST_URL \
                          -Dsonar.login=$SONAR_TOKEN
                        """
                    }
                }
            }
        }

        stage("Deploy to Kubernetes") {
            steps {
                container('kubectl') {
                    sh """
                    kubectl apply -f k8s/deployment.yaml
                    kubectl apply -f k8s/service.yaml
                    kubectl rollout status deployment/travelstory-deployment -n 2401199
                    """
                }
            }
        }

    }

    post {
        always {
            echo "Pipeline finished."
        }
    }
}
