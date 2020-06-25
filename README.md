# To run the application

1. Clone the repo and enter the project directory
2. install React packages by navigating to the `/client` folder and running `npm i`
3. install go packages by navigating to the `/server` folder and installing the packages listed below (see below for list of packages & instructions) 
4. Start ther server by running `go run server.go` in `/server`
5. After the server starts, start the client by running `npm start` in `/client`
6. The app will be accessible at `localhost:3000`

Go packages:
I'm not familiar with the go package management system, but `gin`, `gorilla`, and `cors`, must be installed using the following commands in terminal at `/server`
1. `go get github.com/gin-contrib/cors`
2. `go get github.com/gorilla/websocket`
3. `go get -u github.com/gin-gonic/gin`


# Instructions
1. Enter your email and click the Join Chat button on the welcome page (at `/`)
2. You will be redirected to `/chat` and a chatbot will broadcast a welcome message
3. You can type more messages
4. You can log on to the chat as a different user in a different browser window. you will see the full chat history, get a greeting message, and be able to add messages as the user you are signed in as.
