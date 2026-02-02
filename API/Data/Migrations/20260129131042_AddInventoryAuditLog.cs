using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddInventoryAuditLog : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "archived_at",
                table: "inventory_items",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "archived_by",
                table: "inventory_items",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_archived",
                table: "inventory_items",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            migrationBuilder.CreateTable(
                name: "inventory_audit_logs",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    company_id = table.Column<Guid>(type: "uuid", nullable: false),
                    inventory_item_id = table.Column<Guid>(type: "uuid", nullable: false),
                    action = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: true),
                    quantity_before = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    quantity_after = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    quantity_changed = table.Column<decimal>(type: "numeric(10,2)", nullable: true),
                    reason = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    related_montage_id = table.Column<Guid>(type: "uuid", nullable: true),
                    details = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_inventory_audit_logs", x => x.id);
                    table.ForeignKey(
                        name: "FK_inventory_audit_logs_AspNetUsers_user_id",
                        column: x => x.user_id,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_inventory_audit_logs_companies_company_id",
                        column: x => x.company_id,
                        principalTable: "companies",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_inventory_audit_logs_inventory_items_inventory_item_id",
                        column: x => x.inventory_item_id,
                        principalTable: "inventory_items",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_inventory_audit_logs_montages_related_montage_id",
                        column: x => x.related_montage_id,
                        principalTable: "montages",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "idx_inventory_audit_action",
                table: "inventory_audit_logs",
                column: "action");

            migrationBuilder.CreateIndex(
                name: "idx_inventory_audit_company_id",
                table: "inventory_audit_logs",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "idx_inventory_audit_created_at",
                table: "inventory_audit_logs",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "idx_inventory_audit_item_id",
                table: "inventory_audit_logs",
                column: "inventory_item_id");

            migrationBuilder.CreateIndex(
                name: "idx_inventory_audit_montage_id",
                table: "inventory_audit_logs",
                column: "related_montage_id");

            migrationBuilder.CreateIndex(
                name: "idx_inventory_audit_user_id",
                table: "inventory_audit_logs",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "inventory_audit_logs");

            migrationBuilder.DropColumn(
                name: "archived_at",
                table: "inventory_items");

            migrationBuilder.DropColumn(
                name: "archived_by",
                table: "inventory_items");

            migrationBuilder.DropColumn(
                name: "is_archived",
                table: "inventory_items");
        }
    }
}
