class Villain {
  constructor({ id, nombre, alias, vida = 200, golpeEspecial = 30, golpeCritico = 45, golpeBasico = 5, ciudad, team, poder = 1, experiencia = 0 }) {
    this.id = id;
    this.nombre = nombre;
    this.alias = alias;
    this.vida = vida;
    this.defensa = 200;
    this.poder = poder;
    this.experiencia = experiencia;
    this.golpeEspecial = golpeEspecial;
    this.golpeCritico = golpeCritico;
    this.golpeBasico = golpeBasico;
    this.ciudad = ciudad;
    this.team = team;
  }
}

module.exports = Villain; 