const knex = require("../database/knex");
const AppError = require("../utils/AppError");

class NotesController {
  async create(request, response) {
    const { title, description, tags, rating } = request.body;
    const { user_id } = request.params;

    const userExists = await knex("users").where("id", user_id).first();

    if (!userExists) {
      throw new AppError("O usuario não existe, logo não da para criar nota.");
    }
    
    const movie_notes_id = await knex("movie_notes").insert({
      title,
      description,
      rating,
      user_id,
    });

    const tagsInsert = tags.map((name) => {
      return {
        movie_notes_id,
        name,
        user_id,
      };
    });
       
    console.log(tagsInsert);

    await knex("movie_tags").insert(tagsInsert);

    response.json();
  }

  async show(request, response) {
    const { id } = request.params;

    const userNoteExists = await knex("movie_notes").where("id", id).first();

    if (!userNoteExists) {
      throw new AppError("Não existe nota!");
    }

    const note = await knex("movie_notes").where({ id }).first();
    const tags = await knex("movie_tags").where({ movie_notes_id: id }).orderBy("name");

    return response.json({
      note,
      tags,
    });
  }

  async delete(request, response) {
    const { id } = request.params;

    const moveNotesExists = await knex("movie_notes").where("id", id).first();

    if (!moveNotesExists) {
      throw new AppError("Não existe nota!.");
    }

    await knex("movie_notes").where({ id }).delete();

    return response.json();
  }

  async index(request, response) {

    const { title, user_id, movie_tags } = request.query;

    let movie_notes;

    if (movie_tags) {
      const filterTags = movie_tags.split(',').map(movie_tag=>movie_tag.trim());
      movie_notes = 
      await knex("movie_tags")
      .select([
        "movie_notes.id",
        "movie_notes.title",
        "movie_notes.user_id"
      ])
      .where("movie_notes.user_id", "=", user_id)
      .whereLike("movie_notes.title",`%${title}%`)
      .whereIn("name", filterTags)
      .innerJoin("movie_notes", "movie_notes.id", "movie_tags.movie_notes_id")
      .orderBy("movie_notes.title")

    } else {
      movie_notes = await knex("movie_notes")
        .where({ user_id })
        .whereLike("title", `%${title}%`)
        .orderBy("title");
    }

    const userTags = await knex("movie_tags").where({user_id});
    console.log(userTags);
    const notesWithTags = movie_notes.map(movie_note =>
       {
        const noteTags = userTags.filter(movie_tag => movie_tag.movie_notes_id === movie_note.id)

      return {
        ...movie_notes,
        tags: noteTags
      }
    })
    return response.json(notesWithTags);

}}
module.exports = NotesController;
