using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddAccountLockoutFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "movies_ratings",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "INTEGER", nullable: false),
                    show_id = table.Column<string>(type: "TEXT", nullable: false),
                    rating = table.Column<decimal>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_movies_ratings", x => new { x.user_id, x.show_id });
                });

            migrationBuilder.CreateTable(
                name: "movies_titles",
                columns: table => new
                {
                    show_id = table.Column<string>(type: "TEXT", nullable: false),
                    type = table.Column<string>(type: "TEXT", nullable: true),
                    title = table.Column<string>(type: "TEXT", nullable: false),
                    director = table.Column<string>(type: "TEXT", nullable: true),
                    cast = table.Column<string>(type: "TEXT", nullable: true),
                    country = table.Column<string>(type: "TEXT", nullable: true),
                    release_year = table.Column<int>(type: "INTEGER", nullable: true),
                    rating = table.Column<string>(type: "TEXT", nullable: true),
                    duration = table.Column<string>(type: "TEXT", nullable: true),
                    description = table.Column<string>(type: "TEXT", nullable: true),
                    Action = table.Column<bool>(type: "INTEGER", nullable: true),
                    Adventure = table.Column<bool>(type: "INTEGER", nullable: true),
                    Anime_Series_International_TV_Shows = table.Column<bool>(type: "INTEGER", nullable: true),
                    British_TV_Shows_Docuseries_International_TV_Shows = table.Column<bool>(type: "INTEGER", nullable: true),
                    Children = table.Column<bool>(type: "INTEGER", nullable: true),
                    Comedies = table.Column<bool>(type: "INTEGER", nullable: true),
                    Comedies_Dramas_International_Movies = table.Column<bool>(type: "INTEGER", nullable: true),
                    Comedies_International_Movies = table.Column<bool>(type: "INTEGER", nullable: true),
                    Comedies_Romantic_Movies = table.Column<bool>(type: "INTEGER", nullable: true),
                    Crime_TV_Shows_Docuseries = table.Column<bool>(type: "INTEGER", nullable: true),
                    Documentaries = table.Column<bool>(type: "INTEGER", nullable: true),
                    Documentaries_International_Movies = table.Column<bool>(type: "INTEGER", nullable: true),
                    Docuseries = table.Column<bool>(type: "INTEGER", nullable: true),
                    Dramas = table.Column<bool>(type: "INTEGER", nullable: true),
                    Dramas_International_Movies = table.Column<bool>(type: "INTEGER", nullable: true),
                    Dramas_Romantic_Movies = table.Column<bool>(type: "INTEGER", nullable: true),
                    Family_Movies = table.Column<bool>(type: "INTEGER", nullable: true),
                    Fantasy = table.Column<bool>(type: "INTEGER", nullable: true),
                    Horror_Movies = table.Column<bool>(type: "INTEGER", nullable: true),
                    International_Movies_Thrillers = table.Column<bool>(type: "INTEGER", nullable: true),
                    International_TV_Shows_Romantic_TV_Shows_TV_Dramas = table.Column<bool>(type: "INTEGER", nullable: true),
                    Kids_TV = table.Column<bool>(type: "INTEGER", nullable: true),
                    Language_TV_Shows = table.Column<bool>(type: "INTEGER", nullable: true),
                    Musicals = table.Column<bool>(type: "INTEGER", nullable: true),
                    Nature_TV = table.Column<bool>(type: "INTEGER", nullable: true),
                    Reality_TV = table.Column<bool>(type: "INTEGER", nullable: true),
                    Spirituality = table.Column<bool>(type: "INTEGER", nullable: true),
                    TV_Action = table.Column<bool>(type: "INTEGER", nullable: true),
                    TV_Comedies = table.Column<bool>(type: "INTEGER", nullable: true),
                    TV_Dramas = table.Column<bool>(type: "INTEGER", nullable: true),
                    Talk_Shows_TV_Comedies = table.Column<bool>(type: "INTEGER", nullable: true),
                    Thrillers = table.Column<bool>(type: "INTEGER", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_movies_titles", x => x.show_id);
                });

            migrationBuilder.CreateTable(
                name: "movies_users",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    name = table.Column<string>(type: "TEXT", nullable: false),
                    phone = table.Column<string>(type: "TEXT", nullable: false),
                    email = table.Column<string>(type: "TEXT", nullable: false),
                    age = table.Column<int>(type: "INTEGER", nullable: false),
                    gender = table.Column<string>(type: "TEXT", nullable: false),
                    city = table.Column<string>(type: "TEXT", nullable: false),
                    state = table.Column<string>(type: "TEXT", nullable: false),
                    password = table.Column<string>(type: "TEXT", nullable: false),
                    isAdmin = table.Column<int>(type: "INTEGER", nullable: false),
                    FailedLoginAttempts = table.Column<int>(type: "INTEGER", nullable: false),
                    LockoutEnd = table.Column<DateTime>(type: "TEXT", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_movies_users", x => x.user_id);
                });

            migrationBuilder.CreateTable(
                name: "user_favorites",
                columns: table => new
                {
                    favorite_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    user_id = table.Column<int>(type: "INTEGER", nullable: false),
                    movie_id = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_favorites", x => x.favorite_id);
                });

            migrationBuilder.CreateTable(
                name: "user_watchlist",
                columns: table => new
                {
                    watchlist_id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    user_id = table.Column<int>(type: "INTEGER", nullable: false),
                    movie_id = table.Column<string>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_watchlist", x => x.watchlist_id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "movies_ratings");

            migrationBuilder.DropTable(
                name: "movies_titles");

            migrationBuilder.DropTable(
                name: "movies_users");

            migrationBuilder.DropTable(
                name: "user_favorites");

            migrationBuilder.DropTable(
                name: "user_watchlist");
        }
    }
}
