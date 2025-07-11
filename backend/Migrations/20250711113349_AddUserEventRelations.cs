using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddUserEventRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EventInterestedUsers_Events_Event1Id",
                table: "EventInterestedUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_EventParticipants_Events_EventId",
                table: "EventParticipants");

            migrationBuilder.DropForeignKey(
                name: "FK_EventWaitlist_Events_Event2Id",
                table: "EventWaitlist");

            migrationBuilder.RenameColumn(
                name: "Event2Id",
                table: "EventWaitlist",
                newName: "WaitlistEventsId");

            migrationBuilder.RenameColumn(
                name: "EventId",
                table: "EventParticipants",
                newName: "ParticipantsEventsId");

            migrationBuilder.RenameColumn(
                name: "Event1Id",
                table: "EventInterestedUsers",
                newName: "InterestedEventsId");

            migrationBuilder.AddForeignKey(
                name: "FK_EventInterestedUsers_Events_InterestedEventsId",
                table: "EventInterestedUsers",
                column: "InterestedEventsId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_EventParticipants_Events_ParticipantsEventsId",
                table: "EventParticipants",
                column: "ParticipantsEventsId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_EventWaitlist_Events_WaitlistEventsId",
                table: "EventWaitlist",
                column: "WaitlistEventsId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_EventInterestedUsers_Events_InterestedEventsId",
                table: "EventInterestedUsers");

            migrationBuilder.DropForeignKey(
                name: "FK_EventParticipants_Events_ParticipantsEventsId",
                table: "EventParticipants");

            migrationBuilder.DropForeignKey(
                name: "FK_EventWaitlist_Events_WaitlistEventsId",
                table: "EventWaitlist");

            migrationBuilder.RenameColumn(
                name: "WaitlistEventsId",
                table: "EventWaitlist",
                newName: "Event2Id");

            migrationBuilder.RenameColumn(
                name: "ParticipantsEventsId",
                table: "EventParticipants",
                newName: "EventId");

            migrationBuilder.RenameColumn(
                name: "InterestedEventsId",
                table: "EventInterestedUsers",
                newName: "Event1Id");

            migrationBuilder.AddForeignKey(
                name: "FK_EventInterestedUsers_Events_Event1Id",
                table: "EventInterestedUsers",
                column: "Event1Id",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_EventParticipants_Events_EventId",
                table: "EventParticipants",
                column: "EventId",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_EventWaitlist_Events_Event2Id",
                table: "EventWaitlist",
                column: "Event2Id",
                principalTable: "Events",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
