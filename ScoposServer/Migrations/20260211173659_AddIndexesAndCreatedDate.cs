using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ScoposServer.Migrations
{
    /// <inheritdoc />
    public partial class AddIndexesAndCreatedDate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EqEquipment",
                columns: table => new
                {
                    Code = table.Column<string>(type: "text", nullable: false),
                    ModelCode = table.Column<string>(type: "text", nullable: true),
                    Name = table.Column<string>(type: "text", nullable: true),
                    Type = table.Column<string>(type: "text", nullable: true),
                    IsDel = table.Column<bool>(type: "boolean", nullable: false),
                    ParentCode = table.Column<string>(type: "text", nullable: true),
                    ParentName = table.Column<string>(type: "text", nullable: true),
                    ParentType = table.Column<string>(type: "text", nullable: true),
                    ClassCode = table.Column<string>(type: "text", nullable: true),
                    ClassName = table.Column<string>(type: "text", nullable: true),
                    ClassType = table.Column<string>(type: "text", nullable: true),
                    PrDepCode = table.Column<string>(type: "text", nullable: true),
                    PrDepName = table.Column<string>(type: "text", nullable: true),
                    BranchCode = table.Column<string>(type: "text", nullable: true),
                    BranchName = table.Column<string>(type: "text", nullable: true),
                    InventoryNumber = table.Column<string>(type: "text", nullable: true),
                    Manufacturer = table.Column<string>(type: "text", nullable: true),
                    SerialNumber = table.Column<string>(type: "text", nullable: true),
                    ProductYear = table.Column<string>(type: "text", nullable: true),
                    ProductMonth = table.Column<string>(type: "text", nullable: true),
                    ComissioningDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    UserStat = table.Column<string>(type: "text", nullable: true),
                    SystemStat = table.Column<string>(type: "text", nullable: true),
                    MvzCode = table.Column<string>(type: "text", nullable: true),
                    MvzName = table.Column<string>(type: "text", nullable: true),
                    Location = table.Column<string>(type: "text", nullable: true),
                    EpbObjectCode = table.Column<string>(type: "text", nullable: true),
                    EpbComplexCode = table.Column<string>(type: "text", nullable: true),
                    EpbTypeNameCode = table.Column<string>(type: "text", nullable: true),
                    EpbDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EpbNextDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    EpbNextDatePlan = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EqEquipment", x => x.Code);
                });

            migrationBuilder.CreateTable(
                name: "EqNotify",
                columns: table => new
                {
                    QmCode = table.Column<string>(type: "text", nullable: false),
                    FeCode = table.Column<string>(type: "text", nullable: false),
                    EoCode = table.Column<string>(type: "text", nullable: false),
                    QmType = table.Column<string>(type: "text", nullable: true),
                    QmGrpCode = table.Column<string>(type: "text", nullable: true),
                    QmGrpName = table.Column<string>(type: "text", nullable: true),
                    QmCodCode = table.Column<string>(type: "text", nullable: true),
                    QmCodName = table.Column<string>(type: "text", nullable: true),
                    Organization = table.Column<string>(type: "text", nullable: true),
                    FeGrpCode = table.Column<string>(type: "text", nullable: true),
                    FeGrpName = table.Column<string>(type: "text", nullable: true),
                    FeCodCode = table.Column<string>(type: "text", nullable: true),
                    FeCodName = table.Column<string>(type: "text", nullable: true),
                    FeName = table.Column<string>(type: "text", nullable: true),
                    Criticality = table.Column<string>(type: "text", nullable: true),
                    EliminationStatus = table.Column<string>(type: "text", nullable: true),
                    EliminationDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    RepairStatus = table.Column<string>(type: "text", nullable: true),
                    Order = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EqNotify", x => x.QmCode);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EqEquipment");

            migrationBuilder.DropTable(
                name: "EqNotify");
        }
    }
}
