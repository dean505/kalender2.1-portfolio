import React, { useState } from "react";
import { deleteCategory as deleteCategoryRequest, saveCategory } from "../services/categoryService";

const EMPTY_CATEGORY_FORM = {
  id: "",
  name: "",
  description: "",
  durationMinutes: "",
};

export default function AdminCategoryManager({ categories, reloadCategories }) {
  const [formOpen, setFormOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_CATEGORY_FORM);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    await saveCategory(form);
    alert(`Kategorie ${form.id ? "aktualisiert" : "erstellt"}.`);
    setForm(EMPTY_CATEGORY_FORM);
    await reloadCategories?.();
  }

  function editCategory(category) {
    setForm({
      id: category.id,
      name: category.name,
      description: category.description,
      durationMinutes: category.durationMinutes ?? 40,
    });
    setFormOpen(true);
  }

  async function deleteCategory(id) {
    if (!window.confirm("Kategorie wirklich löschen?")) return;
    await deleteCategoryRequest(id);
    await reloadCategories?.();
  }

  return (
    <section className="admin-card">
      <h3 style={{ display: "flex", gap: 8 }}>
        <button className="btn btn--primary" onClick={() => setFormOpen((value) => !value)}>
          + Kategorie erstellen
        </button>
        <button className="btn btn--light" onClick={() => setListOpen((value) => !value)}>
          Kategorien verwalten
        </button>
      </h3>

      {formOpen && (
        <form className="grid grid--2" onSubmit={handleSubmit}>
          <input type="hidden" value={form.id} readOnly />
          <label>
            <span className="label">Name</span>
            <input
              className="input"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              required
            />
          </label>
          <label>
            <span className="label">Dauer (Min)</span>
            <input
              type="number"
              className="input"
              value={form.durationMinutes}
              onChange={(e) => updateField("durationMinutes", e.target.value)}
              required
            />
          </label>
          <label className="grid--full">
            <span className="label">Beschreibung</span>
            <input
              className="input"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              required
            />
          </label>
          <div className="grid--full" style={{ textAlign: "right" }}>
            <button className="btn btn--primary" type="submit">
              {form.id ? "Aktualisieren" : "Erstellen"}
            </button>
          </div>
        </form>
      )}

      {listOpen && (
        <ul className="list">
          {(categories || []).map((category) => (
            <li key={category.id} className="list-row">
              <div>
                {category.name}{" "}
                <span className="muted">({category.durationMinutes} Min)</span>{" "}
                - {category.description}
              </div>
              <div className="row-actions">
                <button className="btn btn--light" onClick={() => editCategory(category)}>
                  Bearbeiten
                </button>
                <button className="btn btn--danger" onClick={() => deleteCategory(category.id)}>
                  Löschen
                </button>
              </div>
            </li>
          ))}
          {(!categories || categories.length === 0) && <li>Keine Kategorien vorhanden.</li>}
        </ul>
      )}
    </section>
  );
}
