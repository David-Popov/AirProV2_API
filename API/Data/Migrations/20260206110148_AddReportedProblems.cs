using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddReportedProblems : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "reported_problems",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_id = table.Column<string>(type: "text", nullable: false),
                    category = table.Column<int>(type: "integer", nullable: false),
                    description = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: false),
                    screenshot_file_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    screenshot_object_name = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    screenshot_content_type = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_reported_problems", x => x.id);
                    table.ForeignKey(
                        name: "FK_reported_problems_AspNetUsers_user_id",
                        column: x => x.user_id,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "idx_reported_problems_category",
                table: "reported_problems",
                column: "category");

            migrationBuilder.CreateIndex(
                name: "idx_reported_problems_created_at",
                table: "reported_problems",
                column: "created_at");

            migrationBuilder.CreateIndex(
                name: "idx_reported_problems_user_id",
                table: "reported_problems",
                column: "user_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "reported_problems");
        }
    }
}
