<!-- PROJECT -->
# Tarpaulin

Tarpaulin is a RESTful API that stores and provides data for a learning management system similar to Canvas. 



<!-- TECHNOLOGIES -->
## Technologies

* [Express](https://expressjs.com/)
* [Docker](https://www.docker.com/)
* [MySQL](https://www.mysql.com/)
* [Redis](https://redis.io/)
* [Sequelize](https://sequelize.org/)
* [JSON Web Token](https://jwt.io/)



<!-- INSTALLATION -->
## Installation

To set up a local copy of the project, follow these steps.

1. Clone the repository
   ```sh
   git clone https://github.com/osu-cs493-sp22/final-project-team-12.git
   ```
2. Install packages
   ```sh
   npm install
   ```
3. Create a `.env` file in the root directory with the environment variables
   ```sh
   MYSQL_DB_NAME="tarpaulin"
   MYSQL_USER="tarpaulin"
   MYSQL_PASSWORD="hunter2"
   ```



<!-- USAGE -->
## Usage

To run the project, follow these steps.

1. Run the app and its services with Docker Compose
   ```sh
   docker-compose up
   ```
2. Test the endpoints with Insomnia by importing the tests provided in the `tests/` directory



<!-- AUTHORS -->
## Authors

CS 493 Final Project Team 12

* [Steven Bui](https://github.com/buistvn)
* [Christian Herinckx](https://github.com/cherinckx14)
* [Alex Young](https://github.com/axyoung)
