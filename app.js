const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const getMovieNamesData = app.get("/movies/", async (request, response) => {
  const moviesNamesQuery = `
             SELECT 
                movie_name
              FROM 
                movie`;
  const moviesData = await db.all(moviesNamesQuery);
  const dbDataToObjectData = moviesData.map((movie) => {
    return {
      movieName: movie.movie_name,
    };
  });
  response.send(dbDataToObjectData);
});

const postMovieData = app.post("/movies/", async (request, response) => {
  //   const movieDetails = request.body;
  const { directorId, movieName, leadActor } = request.body;
  const postMovieDataQuery = `
            INSERT INTO movie (director_id,movie_name,lead_actor)
            VALUES ('${directorId}','${movieName}','${leadActor}');`;
  await db.run(postMovieDataQuery);
  response.send("Movie Successfully Added");
});

const getMovieData = app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieDataQuery = `
         SELECT 
           * 
         FROM 
           movie
         WHERE movie_id = "${movieId}"`;
  const movieData = await db.get(getMovieDataQuery);
  response.send({
    movieId: movieData.movie_id,
    directorId: movieData.director_id,
    movieName: movieData.movie_name,
    leadActor: movieData.lead_actor,
  });
});

const updateMovieData = app.put(
  "/movies/:movieId/",
  async (request, response) => {
    const { movieId } = request.params;
    const updatedMovieDetails = request.body;
    const { directorId, movieName, leadActor } = updatedMovieDetails;
    const updateMovieDataQuery = `
               UPDATE 
                  movie 
                SET director_id = "${directorId}",
                     movie_name = "${movieName}",
                     lead_actor = "${leadActor}"
                WHERE movie_id = "${movieId}";`;

    await db.run(updateMovieDataQuery);
    response.send("Movie Details Updated");
  }
);

const deleteMovieData = app.delete(
  "/movies/:movieId/",
  async (request, response) => {
    const { movieId } = request.params;
    const DeleteMovieDataQuery = `
             DELETE FROM 
                movie
             WHERE movie_id = "${movieId}"`;
    await db.run(DeleteMovieDataQuery);
    response.send("Movie Removed");
  }
);

const getDirectorData = app.get("/directors/", async (request, response) => {
  const getDirectorDataQuery = `
               SELECT 
                 *
               FROM 
                 director`;
  const directorDetails = await db.all(getDirectorDataQuery);
  const dbDataToObjectData = directorDetails.map((director) => {
    return {
      directorId: director.director_id,
      directorName: director.director_name,
    };
  });
  response.send(dbDataToObjectData);
});

const getDirectorMovieData = app.get(
  "/directors/:directorId/movies/",
  async (request, response) => {
    const { directorId } = request.params;
    const getDirectorMovieDataQuery = `
                   SELECT
                     movie_name
                   FROM
                     movie
                   WHERE director_id = "${directorId}"`;
    const directorMovieData = await db.all(getDirectorMovieDataQuery);
    const dbDataToNormalData = directorMovieData.map((item) => {
      return {
        movieName: item.movie_name,
      };
    });
    response.send(dbDataToNormalData);
  }
);
module.exports = app;
