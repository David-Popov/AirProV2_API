using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddMontageAssignments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "montage_assignments",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    montage_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_montage_assignments", x => x.id);
                    table.ForeignKey(
                        name: "FK_montage_assignments_AspNetUsers_user_id",
                        column: x => x.user_id,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_montage_assignments_montages_montage_id",
                        column: x => x.montage_id,
                        principalTable: "montages",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "idx_montage_assignments_montage_id",
                table: "montage_assignments",
                column: "montage_id");

            migrationBuilder.CreateIndex(
                name: "idx_montage_assignments_montage_user_unique",
                table: "montage_assignments",
                columns: new[] { "montage_id", "user_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_montage_assignments_user_id",
                table: "montage_assignments",
                column: "user_id");

            // Backfill: every existing montage with a user_id becomes a single-worker
            // assignment, so the previous creator keeps seeing/editing their montages
            // under the new "assigned workers" visibility model.
            migrationBuilder.Sql(@"
                INSERT INTO montage_assignments (id, montage_id, user_id, created_at)
                SELECT gen_random_uuid(), m.id, m.user_id, now()
                FROM montages m
                WHERE m.user_id IS NOT NULL;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "montage_assignments");
        }
    }
}
