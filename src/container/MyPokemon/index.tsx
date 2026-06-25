import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { usePokemonStore } from "../../store";
import type { CaughtPokemon } from "../../types";
import { capitalize, padId } from "../../lib/utils";
import { TYPE_COLORS } from "../../constant";
import Button from "../../components/button";

const MyPokemon: React.FC = () => {
  const navigate = useNavigate();
  const { myPokemon, releasePokemon, renamePokemon } = usePokemonStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newNickname, setNewNickname] = useState<string>("");
  const [confirmReleaseId, setConfirmReleaseId] = useState<string | null>(null);

  // Handle edit nickname triggers
  const startEdit = (pokemon: CaughtPokemon) => {
    setEditingId(pokemon.uniqueId);
    setNewNickname(pokemon.nickname);
  };

  const saveEdit = (uniqueId: string) => {
    if (newNickname.trim()) {
      renamePokemon(uniqueId, newNickname.trim());
      setEditingId(null);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full min-h-[70vh]">
      {/* Page Header */}
      <div className="text-center space-y-1 py-1">
        <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white m-0">
          My Pokémon Bag
        </h1>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed m-0">
          List of Pokémon you have successfully caught. You can give them a custom nickname or release them back into the wild.
        </p>
      </div>

      {/* Captured Grid List */}
      {myPokemon.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full solid-card rounded-2xl p-10 text-center mt-4 flex flex-col items-center gap-3"
        >
          <div className="text-4xl animate-bounce">🎒</div>
          <div>
            <h3 className="m-0 text-sm font-bold text-gray-800 dark:text-white mb-1.5">
              Your Bag is Empty
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 max-w-xs mx-auto m-0 leading-relaxed">
              You haven't caught any Pokémon yet! Go back to the Pokedex to search for wild Pokémon and try your catch luck.
            </p>
          </div>
          <Link to="/" className="no-underline">
            <Button
              variant="primary"
              className="px-5 py-2 rounded-xl text-xs hover:scale-105 transition-transform"
            >
              Start Adventure
            </Button>
          </Link>
        </motion.div>
      ) : (
        // Grid: 2 Columns on mobile viewport
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
          <AnimatePresence>
            {myPokemon.map((pokemon) => {
              const primaryType = pokemon.types?.[0] || "normal";
              const typeStyle = TYPE_COLORS[primaryType] || TYPE_COLORS.normal;
              const isEditing = editingId === pokemon.uniqueId;

              return (
                <motion.div
                  key={pokemon.uniqueId}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85, y: 10 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="relative rounded-2xl solid-card p-3.5 flex flex-col justify-between overflow-hidden h-[215px] transition-theme cursor-pointer hover:shadow-md hover:border-red-500/25"
                  onClick={() => {
                    if (!isEditing) {
                      navigate(`/pokemon/${pokemon.name}`, { state: { from: "bag", uniqueId: pokemon.uniqueId } });
                    }
                  }}
                >
                  {/* Decorative background glow */}
                  <div
                    className="absolute -top-10 -right-10 w-20 h-20 rounded-full blur-xl opacity-10 dark:opacity-15"
                    style={{ backgroundColor: typeStyle.hex }}
                  ></div>

                  {/* Header Row */}
                  <div className="flex justify-between items-start mb-1 z-10" onClick={(e) => isEditing && e.stopPropagation()}>
                    <div className="w-full">
                      {isEditing ? (
                        <div className="flex flex-col gap-1 relative z-20">
                          <input
                            type="text"
                            value={newNickname}
                            onChange={(e) => setNewNickname(e.target.value)}
                            maxLength={15}
                            className="px-2 py-0.5 bg-white/40 dark:bg-black/40 border border-gray-300 dark:border-gray-700 rounded text-[10px] font-bold text-gray-905 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500 w-full"
                          />
                          <div className="flex gap-1.5 text-[9px] font-extrabold">
                            <button
                              onClick={(e) => { e.stopPropagation(); saveEdit(pokemon.uniqueId); }}
                              className="text-green-500 hover:text-green-600 cursor-pointer bg-none border-none p-0"
                            >
                              Save
                            </button>
                            <span className="text-gray-455">|</span>
                            <button
                              onClick={(e) => { e.stopPropagation(); setEditingId(null); }}
                              className="text-gray-500 hover:text-gray-600 cursor-pointer bg-none border-none p-0"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between w-full group">
                          <h3 className="m-0 text-xs font-extrabold tracking-wide text-gray-800 dark:text-gray-100 truncate pr-2">
                            {pokemon.nickname}
                          </h3>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              startEdit(pokemon);
                            }}
                            className="p-0.5 rounded text-gray-450 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer transition-colors shrink-0"
                            title="Edit Nickname"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                        </div>
                      )}
                      <span className="text-[9px] font-bold text-gray-500 dark:text-gray-350 block mt-0.5 capitalize truncate">
                        {capitalize(pokemon.name)} • {padId(pokemon.id)}
                      </span>
                    </div>
                  </div>

                  {/* Artwork Showcase (animated sprite) */}
                  <div className="relative w-16 h-16 self-center flex items-center justify-center my-1.5 z-10">
                    <div
                      style={{ backgroundColor: `${typeStyle.hex}10` }}
                      className="absolute inset-1 rounded-full"
                    ></div>
                    <img
                      src={pokemon.sprite}
                      alt={pokemon.name}
                      className="w-14 h-14 object-contain z-10"
                    />
                  </div>

                  {/* Captured Info and Badges */}
                  <div className="mt-1 space-y-1.5 z-10">
                    <div className="flex justify-between items-center text-[8px] text-gray-500 dark:text-gray-350 font-extrabold border-b border-gray-250/20 dark:border-gray-800/40 pb-1">
                      <span>Caught:</span>
                      <span className="text-gray-700 dark:text-gray-200">{pokemon.dateCaught.split(", ")[0]}</span>
                    </div>

                    <div className="flex justify-between items-center gap-1.5">
                      {/* Type badges */}
                      <div className="flex flex-wrap gap-0.5 max-w-[75%]">
                        {pokemon.types?.map((type) => {
                          const tStyle = TYPE_COLORS[type] || TYPE_COLORS.normal;
                          return (
                            <span
                              key={type}
                              style={{
                                backgroundColor: tStyle.hex,
                                color: "#ffffff"
                              }}
                              className="px-1.5 py-0.5 rounded-full text-[7px] font-extrabold uppercase tracking-wide shadow-sm"
                            >
                              {type}
                            </span>
                          );
                        })}
                      </div>

                      {/* Compact Release Trash Icon button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmReleaseId(pokemon.uniqueId);
                        }}
                        className="p-1 border border-red-500/20 hover:border-red-500/60 hover:bg-red-500/10 text-red-500 rounded-lg cursor-pointer transition-colors shrink-0 flex items-center justify-center"
                        title="Release Pokémon"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Release Confirmation Dialog Overlay inside mobile layout */}
      <AnimatePresence>
        {confirmReleaseId && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm rounded-[28px] md:rounded-[26px]">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-xs solid-card rounded-2xl p-5 shadow-xl"
            >
              <div className="text-center space-y-3.5">
                <div className="text-3xl">🕊️</div>
                <h3 className="m-0 text-sm font-extrabold text-gray-800 dark:text-gray-100">
                  Release Pokémon?
                </h3>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 m-0 leading-relaxed">
                  Are you sure you want to release{" "}
                  <strong className="text-gray-800 dark:text-gray-200">
                    {myPokemon.find((p) => p.uniqueId === confirmReleaseId)?.nickname}
                  </strong>{" "}
                  back into the wild? This action cannot be undone.
                </p>
                <div className="flex gap-2.5 justify-center pt-1.5 text-xs font-bold">
                  <Button
                    variant="secondary"
                    onClick={() => setConfirmReleaseId(null)}
                    className="px-4 py-1.5 rounded-lg text-[10px]"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => {
                      if (confirmReleaseId) {
                        releasePokemon(confirmReleaseId);
                      }
                      setConfirmReleaseId(null);
                    }}
                    className="px-4 py-1.5 rounded-lg text-[10px] shadow-md shadow-red-650/10"
                  >
                    Yes, Release
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MyPokemon;
