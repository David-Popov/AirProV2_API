using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddTechnicalSpecsToAirConditioners : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "cable_section",
                table: "air_conditioners",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "factory_refrigerant_charge",
                table: "air_conditioners",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "indoor_dimensions",
                table: "air_conditioners",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "max_height_difference",
                table: "air_conditioners",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "max_pipe_length",
                table: "air_conditioners",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "outdoor_dimensions",
                table: "air_conditioners",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "pipe_size_gas",
                table: "air_conditioners",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "pipe_size_liquid",
                table: "air_conditioners",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "power_supply_location",
                table: "air_conditioners",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "recommended_fuse",
                table: "air_conditioners",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "refrigerant_type",
                table: "air_conditioners",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "weight_indoor",
                table: "air_conditioners",
                type: "numeric(5,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "weight_outdoor",
                table: "air_conditioners",
                type: "numeric(5,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "cable_section",
                table: "air_conditioners");

            migrationBuilder.DropColumn(
                name: "factory_refrigerant_charge",
                table: "air_conditioners");

            migrationBuilder.DropColumn(
                name: "indoor_dimensions",
                table: "air_conditioners");

            migrationBuilder.DropColumn(
                name: "max_height_difference",
                table: "air_conditioners");

            migrationBuilder.DropColumn(
                name: "max_pipe_length",
                table: "air_conditioners");

            migrationBuilder.DropColumn(
                name: "outdoor_dimensions",
                table: "air_conditioners");

            migrationBuilder.DropColumn(
                name: "pipe_size_gas",
                table: "air_conditioners");

            migrationBuilder.DropColumn(
                name: "pipe_size_liquid",
                table: "air_conditioners");

            migrationBuilder.DropColumn(
                name: "power_supply_location",
                table: "air_conditioners");

            migrationBuilder.DropColumn(
                name: "recommended_fuse",
                table: "air_conditioners");

            migrationBuilder.DropColumn(
                name: "refrigerant_type",
                table: "air_conditioners");

            migrationBuilder.DropColumn(
                name: "weight_indoor",
                table: "air_conditioners");

            migrationBuilder.DropColumn(
                name: "weight_outdoor",
                table: "air_conditioners");
        }
    }
}
