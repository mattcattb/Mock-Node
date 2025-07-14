CREATE TYPE "public"."crypto_coin_enum" AS ENUM('btc', 'ltc', 'eth', 'usdt', 'usdc');--> statement-breakpoint
CREATE TYPE "public"."transaction_category_enum" AS ENUM('send', 'receive');--> statement-breakpoint
CREATE TYPE "public"."transaction_status_enum" AS ENUM('confirmed', 'pending', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."tx_category_enum" AS ENUM('deposit', 'withdrawal');--> statement-breakpoint
CREATE TABLE "addresses" (
	"address" text PRIMARY KEY NOT NULL,
	"coin" "crypto_coin_enum" NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "addresses_coin_address_unique" UNIQUE("coin","address")
);
--> statement-breakpoint
CREATE TABLE "blocks" (
	"hash" text NOT NULL,
	"coin" "crypto_coin_enum" NOT NULL,
	"height" integer NOT NULL,
	"previousHash" text,
	"timestamp" timestamp with time zone DEFAULT now(),
	"size" integer,
	"transactionCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now() NOT NULL,
	"nonce" bigint DEFAULT 0 NOT NULL,
	CONSTRAINT "blocks_hash_coin_pk" PRIMARY KEY("hash","coin")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"txid" text NOT NULL,
	"coin" "crypto_coin_enum" NOT NULL,
	"blockHash" text,
	"fromAddress" text,
	"toAddress" text NOT NULL,
	"amount" numeric(36, 18) NOT NULL,
	"fee" numeric(36, 18) NOT NULL,
	"vout" integer DEFAULT 0 NOT NULL,
	"category" "transaction_category_enum" NOT NULL,
	"createdAt" timestamp with time zone DEFAULT now(),
	"confirmedAt" timestamp with time zone,
	"cancelledAt" timestamp with time zone,
	CONSTRAINT "transactions_txid_coin_pk" PRIMARY KEY("txid","coin")
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_blockHash_coin_blocks_hash_coin_fk" FOREIGN KEY ("blockHash","coin") REFERENCES "public"."blocks"("hash","coin") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "addresses_coin_index" ON "addresses" USING btree ("coin");