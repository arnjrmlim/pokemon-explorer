
import { getPokemonTypeDetails } from "../services/pokemonApi";

const ALL_TYPES = [
  "normal",
  "fire",
  "water",
  "electric",
  "grass",
  "ice",
  "fighting",
  "poison",
  "ground",
  "flying",
  "psychic",
  "bug",
  "rock",
  "ghost",
  "dragon",
  "dark",
  "steel",
  "fairy",
];

// Cache type responses to avoid repeatedly requesting the same data.
const typeCache = new Map();

async function getCachedType(type) {
  const normalizedType = type.toLowerCase();

  if (!typeCache.has(normalizedType)) {
    const request = getPokemonTypeDetails(normalizedType)
      .catch((error) => {
        typeCache.delete(normalizedType);
        throw error;
      });

    typeCache.set(normalizedType, request);
  }

  return typeCache.get(normalizedType);
}

// --------------------------------------------------
// DEFENSIVE EFFECTIVENESS
// Calculates damage received by a Pokémon.
// --------------------------------------------------

export async function getDefensiveEffectiveness(defendingTypes) {
  const normalizedTypes = defendingTypes.map((type) =>
    typeof type === "string" ? type.toLowerCase() : type.type.name
  );

  const typeDetails = await Promise.all(
    normalizedTypes.map((type) => getCachedType(type))
  );

  const effectiveness = Object.fromEntries(
    ALL_TYPES.map((type) => [type, 1])
  );

  typeDetails.forEach((defendingType) => {
    const relations = defendingType.damage_relations;

    relations.double_damage_from.forEach(({ name }) => {
      effectiveness[name] *= 2;
    });

    relations.half_damage_from.forEach(({ name }) => {
      effectiveness[name] *= 0.5;
    });

    relations.no_damage_from.forEach(({ name }) => {
      effectiveness[name] = 0;
    });
  });

  return effectiveness;
}

// --------------------------------------------------
// OFFENSIVE EFFECTIVENESS
// Calculates damage an attacking Pokémon can deal
// to a defending Pokémon using its own type attacks.
// --------------------------------------------------

export async function getOffensiveEffectiveness(
  attackingTypes,
  defendingTypes
) {
  const normalizedAttackingTypes = attackingTypes.map((type) =>
    typeof type === "string" ? type.toLowerCase() : type.type.name
  );

  const normalizedDefendingTypes = defendingTypes.map((type) =>
    typeof type === "string" ? type.toLowerCase() : type.type.name
  );

  const attackingDetails = await Promise.all(
    normalizedAttackingTypes.map((type) => getCachedType(type))
  );

  return attackingDetails.map((attackingType) => {
    let multiplier = 1;

    const relations = attackingType.damage_relations;

    normalizedDefendingTypes.forEach((defendingType) => {
      if (
        relations.no_damage_to.some(
          (type) => type.name === defendingType
        )
      ) {
        multiplier = 0;
        return;
      }

      if (
        relations.double_damage_to.some(
          (type) => type.name === defendingType
        )
      ) {
        multiplier *= 2;
      }

      if (
        relations.half_damage_to.some(
          (type) => type.name === defendingType
        )
      ) {
        multiplier *= 0.5;
      }
    });

    return {
      attackingType: attackingType.name,
      multiplier,
    };
  });
}

// --------------------------------------------------
// EFFECTIVENESS GROUPS
// Organizes types by damage multiplier.
// --------------------------------------------------

export function groupEffectiveness(effectiveness) {
  return {
    weaknesses: Object.entries(effectiveness)
      .filter(([, multiplier]) => multiplier > 1)
      .sort((a, b) => b[1] - a[1]),

    resistances: Object.entries(effectiveness)
      .filter(([, multiplier]) => multiplier > 0 && multiplier < 1)
      .sort((a, b) => a[1] - b[1]),

    immunities: Object.entries(effectiveness)
      .filter(([, multiplier]) => multiplier === 0),

    neutral: Object.entries(effectiveness)
      .filter(([, multiplier]) => multiplier === 1),
  };
}
