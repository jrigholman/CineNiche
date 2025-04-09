﻿// <auto-generated />
using System;
using CineNiche.API.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace Backend.Migrations
{
    [DbContext(typeof(MoviesDbContext))]
    [Migration("20250409155531_AddAccountLockoutFields")]
    partial class AddAccountLockoutFields
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "8.0.13");

            modelBuilder.Entity("CineNiche.API.Data.MovieUser", b =>
                {
                    b.Property<int>("user_id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<int>("FailedLoginAttempts")
                        .HasColumnType("INTEGER");

                    b.Property<DateTime?>("LockoutEnd")
                        .HasColumnType("TEXT");

                    b.Property<int>("age")
                        .HasColumnType("INTEGER");

                    b.Property<string>("city")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("email")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("gender")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<int>("isAdmin")
                        .HasColumnType("INTEGER");

                    b.Property<string>("name")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("password")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("phone")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("state")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.HasKey("user_id");

                    b.ToTable("movies_users", (string)null);
                });

            modelBuilder.Entity("CineNiche.API.Data.UserFavorite", b =>
                {
                    b.Property<int>("favorite_id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("movie_id")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<int>("user_id")
                        .HasColumnType("INTEGER");

                    b.HasKey("favorite_id");

                    b.ToTable("user_favorites", (string)null);
                });

            modelBuilder.Entity("CineNiche.API.Data.UserWatchlist", b =>
                {
                    b.Property<int>("watchlist_id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("movie_id")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<int>("user_id")
                        .HasColumnType("INTEGER");

                    b.HasKey("watchlist_id");

                    b.ToTable("user_watchlist", (string)null);
                });

            modelBuilder.Entity("MovieRating", b =>
                {
                    b.Property<int>("user_id")
                        .HasColumnType("INTEGER")
                        .HasColumnOrder(1);

                    b.Property<string>("show_id")
                        .HasColumnType("TEXT")
                        .HasColumnOrder(2);

                    b.Property<decimal?>("rating")
                        .HasColumnType("TEXT");

                    b.HasKey("user_id", "show_id");

                    b.ToTable("movies_ratings", (string)null);
                });

            modelBuilder.Entity("MovieTitle", b =>
                {
                    b.Property<string>("show_id")
                        .HasColumnType("TEXT");

                    b.Property<bool?>("Action")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("Adventure")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("Anime_Series_International_TV_Shows")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("British_TV_Shows_Docuseries_International_TV_Shows")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("Children")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("Comedies")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("Comedies_Dramas_International_Movies")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("Comedies_International_Movies")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("Comedies_Romantic_Movies")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("Crime_TV_Shows_Docuseries")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("Documentaries")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("Documentaries_International_Movies")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("Docuseries")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("Dramas")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("Dramas_International_Movies")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("Dramas_Romantic_Movies")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("Family_Movies")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("Fantasy")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("Horror_Movies")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("International_Movies_Thrillers")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("International_TV_Shows_Romantic_TV_Shows_TV_Dramas")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("Kids_TV")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("Language_TV_Shows")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("Musicals")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("Nature_TV")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("Reality_TV")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("Spirituality")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("TV_Action")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("TV_Comedies")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("TV_Dramas")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("Talk_Shows_TV_Comedies")
                        .HasColumnType("INTEGER");

                    b.Property<bool?>("Thrillers")
                        .HasColumnType("INTEGER");

                    b.Property<string>("cast")
                        .HasColumnType("TEXT");

                    b.Property<string>("country")
                        .HasColumnType("TEXT");

                    b.Property<string>("description")
                        .HasColumnType("TEXT");

                    b.Property<string>("director")
                        .HasColumnType("TEXT");

                    b.Property<string>("duration")
                        .HasColumnType("TEXT");

                    b.Property<string>("rating")
                        .HasColumnType("TEXT");

                    b.Property<int?>("release_year")
                        .HasColumnType("INTEGER");

                    b.Property<string>("title")
                        .IsRequired()
                        .HasColumnType("TEXT");

                    b.Property<string>("type")
                        .HasColumnType("TEXT");

                    b.HasKey("show_id");

                    b.ToTable("movies_titles", (string)null);
                });
#pragma warning restore 612, 618
        }
    }
}
