using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace API.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddIsActiveAndHasUsedTrial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Add has_used_trial column to companies
            migrationBuilder.AddColumn<bool>(
                name: "has_used_trial",
                table: "companies",
                type: "boolean",
                nullable: false,
                defaultValue: false);

            // Add is_active column to AspNetUsers (default TRUE for existing users)
            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                table: "AspNetUsers",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            // DATA MIGRATION: Migrate existing FreeTrial companies to Free plan with trial used
            migrationBuilder.Sql(@"
                UPDATE companies
                SET subscription_plan = 10,           -- 10 = Free enum value
                    has_used_trial = true,            -- Mark trial as used
                    subscription_status = 1,          -- 1 = Active enum value
                    trial_start_date = NULL,          -- Clear trial dates for Free plan
                    trial_end_date = NULL             -- Clear trial dates for Free plan
                WHERE subscription_plan = 0;          -- 0 = FreeTrial (existing companies)
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "has_used_trial",
                table: "companies");

            migrationBuilder.DropColumn(
                name: "is_active",
                table: "AspNetUsers");
        }
    }
}
