# mock-node ⛓️

A multi-chain mock cryptocurrency node designed for local development and testing. `mock-node` provides a realistic RPC-like API for simulating Bitcoin (BTC), Ethereum (ETH), Litecoin (LTC), and more, without needing to run heavy, resource-intensive blockchain clients. I built this project for EV when designing out my payment transaction scanner while the coin infastructure was still under development.

This project is built with a focus on clean architecture and generalizability among coins. For now, it has a general structure that follows a simplified UTXO model for all coins.

## Features

* **Multi-Chain Support:** Simulate node functionalities for BTC, LTC, ETH, USDT, and USDC out of the box.
* **Realistic Node RPCs:** Includes essential endpoints for `getBalance`, `generateAddress`, `createWithdrawal`, and block `scan` operations.
* **Dev-Focused Mining API:** A dedicated `/dev` API to instantly mine new blocks and confirm transactions, speeding up development cycles.
* **Hybrid Ledger Model:** Accurately simulates **UTXO-based** ledgers to reflect real-world blockchain architecture.
* **Containerized Dependencies:** Comes with a Docker Compose setup for one-command database provisioning (PostgreSQL).

## Matty Stack

* **Backend:** Hono (Node.js)
* **Language:** TypeScript
* **Database:** PostgreSQL
* **ORM:** Drizzle ORM
* **Runtime:** Bun
* **Containerization:** Docker

## Getting Started

Follow these instructions to get a local instance of `mock-node` up and running.

### Prerequisites

* [Bun](https://bun.sh/)
* [Docker](https://www.docker.com/get-started) & Docker Compose
* [Git](https://git-scm.com/)

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone [https://github.com/your-username/mock-node.git](https://github.com/your-username/mock-node.git)
    cd mock-node
    ```

2.  **Configure Environment Variables:**
    Create a `.env` file by copying the example file.
    ```sh
    cp .env.example .env
    ```
    Now, open the `.env` file and fill in the required variables. The `DATABASE_URL` should match the credentials in the `docker-compose.yml` file.

3.  **Start the Database:**
    Run the following command to start the PostgreSQL database in a Docker container.
    ```sh
    docker-compose up -d
    ```

4.  **Install Dependencies:**
    ```sh
    bun install
    ```

5.  **Run Database Migrations:**
    This will apply the required database schema to your PostgreSQL container.
    ```sh
    bun run db:migrate
    ```

6.  **Run the Development Server:**
    ```sh
    bun run dev
    ```
    The server will be running on `http://localhost:4000`.

## ⚙️ Configuration

Create a `.env` file in the project root with the following variables:

```env
# .env.example

# URL for the PostgreSQL database. Should match the docker-compose setup.
DATABASE_URL="postgres://user:password@localhost:5432/mock_node_db"

# A placeholder address used for internal 'send' transactions.
INTERNAL_HOTWALLET_ADDRESS="internal-hot-wallet-address"
```

## TODO

This project is under active development. Future enhancements include:

- [ ] **Mempool Simulation:** Implement a mempool for realistic transaction pending states.
- [ ] **UTXO and Account Based Architecture:** Accurately model transaction movement for UTXO for BTC and LTC, and account based transactions for ETH, USDT and USDC .
- [ ] **Advanced Fee Market:** Model gas fees (EIP-1559) for ETH and transaction fees for BTC.

## 📄 License

This project is licensed under the MIT License.