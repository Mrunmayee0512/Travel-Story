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
        // Nexus registry base (change if your nexus host differs)
        NEXUS_REG := 'nexus-service-for-docker-hosted-registry.nexus.svc.cluster.local:8085'
        NEXUS_REPO := "${env.NEXUS_REG}/mpanderepo"
        IMAGE_NAME := "${env.NEXUS_REPO}/travelstory-frontend"
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
                        echo "Using node: $(node -v)  npm: $(npm -v)"
                        npm ci --no-audit --no-fund
                        npm run build
                        ls -la dist || ls -la build || true
                    '''
                }
            }
        }

        stage('Docker Login (Nexus)') {
            steps {
                // uses Jenkins credential of type "Username with password" with id 'nexus-creds'
                withCredentials([usernamePassword(credentialsId: 'nexus-creds', usernameVariable: 'NEXUS_USER', passwordVariable: 'NEXUS_PASS')]) {
                    container('dind') {
                        sh '''
                            set -e
                            echo "Logging in to Nexus docker registry..."
                            docker login ${NEXUS_REG} -u "${NEXUS_USER}" -p "${NEXUS_PASS}"
                            docker info | sed -n '1,120p'
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
                        echo "Building docker image from ./frontend"
                        TAG="${IMAGE_NAME}:${BUILD_NUMBER}"
                        docker build -t "${TAG}" ./frontend
                        # also tag as latest (or pick your semantic tag)
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
                        echo "Pushing ${TAG} and latest to Nexus..."
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
                        # If you have a Sonar token stored in Jenkins, replace the actual token usage
                        sonar-scanner \
                            -Dsonar.projectKey=Travel-Story \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=http://sonarqube.imcc.com/ \
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
                        # Make sure your k8s deployment references the same image name & tag as pushed above
                        # Example uses :latest - change if you prefer BUILD_NUMBER
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
            echo "Cleaning up workspace..."
            cleanWs()
        }
        success {
            echo "Pipeline completed successfully."
        }
        failure {
            echo "Pipeline failed."
        }
    }
}
