using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddCustomAcFieldsToMontage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "custom_ac_brand",
                table: "montages",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "custom_ac_kilowatts",
                table: "montages",
                type: "numeric(5,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "custom_ac_model",
                table: "montages",
                type: "character varying(200)",
                maxLength: 200,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "custom_ac_brand",
                table: "montages");

            migrationBuilder.DropColumn(
                name: "custom_ac_kilowatts",
                table: "montages");

            migrationBuilder.DropColumn(
                name: "custom_ac_model",
                table: "montages");
        }
    }
}
