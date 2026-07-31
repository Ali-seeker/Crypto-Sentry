-- CreateTable
CREATE TABLE "MonitoredAsset" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "added_by" TEXT,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MonitoredAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MonitoredAsset_asset_id_key" ON "MonitoredAsset"("asset_id");
