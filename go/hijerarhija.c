// ovdje dodati neophodne importe
import java.util.*;
public class HijerarhijaKlasa
{
    // ovdje dodati novi interfejs
    public interface IPrint {
        void Printaj();
    }

    public static class PogresneTabliceException extends Exception {
        public PogresneTabliceException(String s) { super(s); }
    }

    public abstract static class Vozilo
    {
        protected String brojTablica;
        protected Integer predjenaKilometraza;
        protected boolean daLiJeNovo;

        public String getBrojTablica()
        {
            return brojTablica;
        }

        public void setBrojTablica(String brojTablica) throws PogresneTabliceException {
            if(brojTablica.indexOf("-") != 3 || brojTablica.length() != 7)
                throw new PogresneTabliceException("Pogresan format tablica auta!");
            try {
                Integer.parseInt(brojTablica.substring(0,3));
                Integer.parseInt(brojTablica.substring(4,8));
            } catch(NumberFormatException e) {
                throw new PogresneTabliceException("Pogresan format tablica auta!");
            }
            this.brojTablica = brojTablica;
        }


        public Integer getPredjenaKilometraza()
        {
            return predjenaKilometraza;
        }

        public void setPredjenaKilometraza(Integer predjenaKilometraza)
        {
            this.predjenaKilometraza = predjenaKilometraza;
        }

        public boolean getDaLiJeNovo()
        {
            return daLiJeNovo;
        }

        public void setDaLiJeNovo(boolean daLiJeNovo)
        {
            this.daLiJeNovo = daLiJeNovo;
        }

        public Vozilo(String brojTablica, Integer predjenaKilometraza, boolean daLiJeNovo) throws PogresneTabliceException {
            this.setBrojTablica(brojTablica);
            this.setPredjenaKilometraza(predjenaKilometraza);
            this.setDaLiJeNovo(daLiJeNovo);
        }
    }

    // ovdje dodati enum MarkaAuta
    public enum MarkaAuta {
        Suzuki, Mercedes, Volkswagen, Renault
    }

    public static class Auto extends Vozilo implements IPrint
    {
        private MarkaAuta markaAuta;
        private Double zapreminaRezervoara;
        private Integer brojSjedista;

        public MarkaAuta getMarkaAuta()
        {
            return markaAuta;
        }

        public void setMarkaAuta(MarkaAuta markaAuta)
        {
            this.markaAuta = markaAuta;
        }

        public Double getZapreminaRezervoara()
        {
            return zapreminaRezervoara;
        }

        public void setZapreminaRezervoara(Double zapreminaRezervoara)
        {
            this.zapreminaRezervoara = zapreminaRezervoara;
        }

        public Integer getBrojSjedista()
        {
            return brojSjedista;
        }

        public void setBrojSjedista(Integer brojSjedista)
        {
            this.brojSjedista = brojSjedista;
        }

        public Auto(String brojTablica, Integer predjenaKilometraza, boolean daLiJeNovo, MarkaAuta markaAuta, Double zapreminaRezervoara, Integer brojSjedista) throws PogresneTabliceException {
            super(brojTablica, predjenaKilometraza, daLiJeNovo);
            this.setMarkaAuta(markaAuta);
            this.setZapreminaRezervoara(zapreminaRezervoara);
            this.setBrojSjedista(brojSjedista);
        }

        public void Printaj() {
            if(this.daLiJeNovo)
                System.out.println("Auto " + markaAuta + " tablica " + brojTablica + " koje je novo");
            else
                System.out.println("Auto " + markaAuta + " tablica " + brojTablica + " sa predjenih " + predjenaKilometraza + " kilometara");

        }

        // ovdje dodati metode koje su potrebne
    }

    // ovdje dodati enum MarkaMotora
    public enum MarkaMotora {
        HarleyDavidson, Suzuki
    }

    public static class Motor extends Vozilo implements IPrint
    {
        private MarkaMotora markaMotora;
        private boolean sportski;

        public MarkaMotora getMarkaMotora()
        {
            return markaMotora;
        }

        public void setMarkaMotora(MarkaMotora markaMotora)
        {
            this.markaMotora = markaMotora;
        }

        public boolean getSportski()
        {
            return sportski;
        }

        public void setSportski(boolean sportski)
        {
            this.sportski = sportski;
        }

        public Motor(String brojTablica, Integer predjenaKilometraza, boolean daLiJeNovo, MarkaMotora markaMotora, boolean sportski) throws PogresneTabliceException {
            super(brojTablica, predjenaKilometraza, daLiJeNovo);
            this.setMarkaMotora(markaMotora);
            this.setSportski(sportski);
        }

        public void Printaj() {
            if(daLiJeNovo)
                System.out.println("Motor " + markaMotora + " tablica " + brojTablica + " koji je nov");
            else
                System.out.println("Motor " + markaMotora + " tablica " + brojTablica + " sa predjenih " + predjenaKilometraza + " kilometara");

        }
    }

    public static class SalonVozila implements IPrint
    {
        private String naziv;
        private List<Vozilo> vozila;

        public String getNaziv()
        {
            return naziv;
        }

        public void setNaziv(String naziv)
        {
            this.naziv = naziv;
        }

        public List<Vozilo> getVozila()
        {
            return vozila;
        }

        public void setVozila(List<Vozilo> vozila)
        {
            this.vozila = vozila;
        }

        public SalonVozila(String naziv)
        {
            this.naziv = naziv;
        }

        public Boolean DodajVozilo(HijerarhijaKlasa.Auto a) {
            vozila.add(a);
            return true;
        }
        public Boolean DodajVozilo(HijerarhijaKlasa.Motor a) {
            vozila.add(a);
            return true;
        }
        public int DajSvaVozila(MarkaAuta a, MarkaMotora m) {
            int count = 0;
            if(a == null) {
                for(int i = 0; i < vozila.size(); i++) {
                    if(vozila.get(i) instanceof HijerarhijaKlasa.Auto)
                        continue;
                    else if(((HijerarhijaKlasa.Motor)vozila.get(i)).getMarkaMotora() == m)
                        count++;
                }
            } else if(m == null) {
                for(int i = 0; i < vozila.size(); i++) {
                    if(vozila.get(i) instanceof HijerarhijaKlasa.Motor)
                        continue;
                    else if(((HijerarhijaKlasa.Auta)vozila.get(i)).getMarkaAuta() == a)
                        count++;
                }
            }
            return count;
        }
        public void Printaj() {
            System.out.println("Salon vozila "+naziv+" sa " + vozila.size() + " vozila");
        }
    }
}
