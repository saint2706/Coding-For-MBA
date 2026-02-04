"""Flask application factory for the Day 35 text analyzer."""

from __future__ import annotations

import os
from typing import Any, Dict, Optional

from flask import (
    Flask,
    Response,
    make_response,
    redirect,
    render_template,
    request,
    session,
    url_for,
)

from .text_utils import clean_text, lex_div_calc, most_common_word


def create_app(config: Optional[Dict[str, Any]] = None) -> Flask:
    """Create and configure the Flask application instance."""

    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
    app = Flask(
        __name__,
        static_folder=os.path.join(base_dir, "static"),
        template_folder=os.path.join(base_dir, "templates"),
    )
    app.config["SEND_FILE_MAX_AGE_DEFAULT"] = 0
    app.config.setdefault("SECRET_KEY", os.environ.get("FLASK_SECRET_KEY", "dev"))

    if config:
        app.config.update(config)

    @app.route("/")
    def home() -> str:
        techs = ["CSS", "Flask", "HTML", "Python"]
        name = "Text Analyzer"
        return render_template("home.html", techs=techs, name=name, title="Home")

    @app.route("/about")
    def about() -> str:
        name = "Rishabh Agrawal"
        return render_template("about.html", name=name, title="About Us")

    @app.route("/result")
    def result() -> str:
        raw_content = session.get("content", "")
        clean_content = clean_text(raw_content)

        if clean_content:
            most_used_words = most_common_word(clean_content)
            most_used_word = most_used_words[0][0] if most_used_words else ""
            lexical_diversity_text = lex_div_calc(clean_content)
        else:
            most_used_words = []
            most_used_word = ""
            lexical_diversity_text = "0.0"

        total_words = len(clean_content.split()) if clean_content else 0
        number_of_chars = len(clean_content)

        return render_template(
            "result.html",
            clean_content=clean_content,
            most_used_word=most_used_word,
            most_used_words=most_used_words,
            total_words=total_words,
            number_of_chars=number_of_chars,
            lexical_diversity_text=lexical_diversity_text,
        )

    @app.route("/post", methods=["GET", "POST"])
    def post() -> Response:
        name = "Text Analyzer"
        if request.method == "GET":
            return make_response(render_template("post.html", name=name, title=name))

        session["content"] = request.form.get("content", "")
        return redirect(url_for("result"))

    return app
