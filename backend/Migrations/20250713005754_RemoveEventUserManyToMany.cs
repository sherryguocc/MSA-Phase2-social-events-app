using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class RemoveEventUserManyToMany : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EventInterestedUsers");

            migrationBuilder.DropTable(
                name: "EventParticipants");

            migrationBuilder.DropTable(
                name: "EventWaitlist");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "EventInterestedUsers",
                columns: table => new
                {
                    InterestedEventsId = table.Column<int>(type: "INTEGER", nullable: false),
                    InterestedUsersId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventInterestedUsers", x => new { x.InterestedEventsId, x.InterestedUsersId });
                    table.ForeignKey(
                        name: "FK_EventInterestedUsers_Events_InterestedEventsId",
                        column: x => x.InterestedEventsId,
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EventInterestedUsers_Users_InterestedUsersId",
                        column: x => x.InterestedUsersId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EventParticipants",
                columns: table => new
                {
                    ParticipantsEventsId = table.Column<int>(type: "INTEGER", nullable: false),
                    ParticipantsId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventParticipants", x => new { x.ParticipantsEventsId, x.ParticipantsId });
                    table.ForeignKey(
                        name: "FK_EventParticipants_Events_ParticipantsEventsId",
                        column: x => x.ParticipantsEventsId,
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EventParticipants_Users_ParticipantsId",
                        column: x => x.ParticipantsId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "EventWaitlist",
                columns: table => new
                {
                    WaitlistEventsId = table.Column<int>(type: "INTEGER", nullable: false),
                    WaitlistId = table.Column<int>(type: "INTEGER", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EventWaitlist", x => new { x.WaitlistEventsId, x.WaitlistId });
                    table.ForeignKey(
                        name: "FK_EventWaitlist_Events_WaitlistEventsId",
                        column: x => x.WaitlistEventsId,
                        principalTable: "Events",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_EventWaitlist_Users_WaitlistId",
                        column: x => x.WaitlistId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EventInterestedUsers_InterestedUsersId",
                table: "EventInterestedUsers",
                column: "InterestedUsersId");

            migrationBuilder.CreateIndex(
                name: "IX_EventParticipants_ParticipantsId",
                table: "EventParticipants",
                column: "ParticipantsId");

            migrationBuilder.CreateIndex(
                name: "IX_EventWaitlist_WaitlistId",
                table: "EventWaitlist",
                column: "WaitlistId");
        }
    }
}
