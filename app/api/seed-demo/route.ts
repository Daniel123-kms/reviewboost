import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const REVIEWS = [
  { author: "Stefan Brandner", platform: "Google", rating: 5, responded: true, daysAgo: 2, content: "Absolut fantastisch! Das Gyros-Teller war so wie ich es aus Athen kenne – zartes Fleisch, perfekt gewürzt, dazu die cremigste Tzatziki Wiens. Das Personal ist herzlich und aufmerksam. Wird definitiv unser neues Stammlokal!" },
  { author: "Maria Hofer", platform: "Google", rating: 5, responded: false, daysAgo: 5, content: "Marco's ist ein echter Geheimtipp in Wien! Wir waren zu viert und alle waren begeistert. Die Moussaka war ein Gedicht, und der griechische Wein dazu einfach perfekt. Die Atmosphäre ist gemütlich und authentisch. Sehr zu empfehlen!" },
  { author: "Thomas Reiter", platform: "Tripadvisor", rating: 4, responded: true, daysAgo: 7, content: "Sehr gutes griechisches Restaurant mit frischen Zutaten. Die Vorspeisen-Platte für zwei war reichhaltig und lecker. Einziges Manko: Die Wartezeit war etwas länger als erwartet, aber das Essen hat es auf jeden Fall wert gemacht." },
  { author: "Julia Schwarz", platform: "Google", rating: 5, responded: false, daysAgo: 9, content: "Das frischeste griechische Essen das ich je in Wien hatte! Man merkt dass hier wirklich mit Liebe gekocht wird. Der Souvlaki war traumhaft und der Salat mit echtem griechischen Käse – nicht dieser weiche Supermarkt-Feta. Direkt nächste Woche wieder!" },
  { author: "Klaus Maier", platform: "Google", rating: 3, responded: false, daysAgo: 11, content: "Essen war ok, aber nichts Besonderes für den Preis. Die Portion war eher klein für €18. Das Lokal war auch recht laut an dem Abend. Service war freundlich aber überfordert." },
  { author: "Anna Gruber", platform: "Tripadvisor", rating: 5, responded: true, daysAgo: 14, content: "Wir feiern hier jetzt jedes Jahr unseren Hochzeitstag! Marco himself ist oft vor Ort und sorgt dafür dass sich alle wohlfühlen. Das Lammkotelett ist unser Highlight – außen knusprig, innen zart. Die Desserts sind auch ein Traum." },
  { author: "Michael Bauer", platform: "Google", rating: 4, responded: false, daysAgo: 16, content: "Super Qualität, frische Zutaten, nettes Personal. Die Calamari als Vorspeise waren perfekt frittiert, nicht fettig. Hauptspeise hat etwas länger gedauert, aber der Koch hat sich entschuldigt und einen Ouzo aufs Haus spendiert. Das nenn ich Service!" },
  { author: "Sandra Müller", platform: "Facebook", rating: 5, responded: true, daysAgo: 18, content: "Bestes griechisches Restaurant in Wien ohne Frage! Ich war schon in Griechenland und das hier kommt sehr nah ran. Vegetarische Optionen sind auch sehr gut – die gefüllten Paprika und das Spanakopita sind meine Favoriten. Sehr zu empfehlen!" },
  { author: "Peter Wagner", platform: "Google", rating: 2, responded: false, daysAgo: 22, content: "Leider enttäuscht. Das Fleisch war trocken und kalt als es ankam. Wir mussten 20 Minuten auf einen Tisch warten obwohl wir reserviert hatten. Für den Preis erwarte ich mehr. Vielleicht hatten wir einen schlechten Tag, aber das war nicht unser bester Abend." },
  { author: "Lisa Huber", platform: "Tripadvisor", rating: 5, responded: true, daysAgo: 25, content: "Einfach wunderbar! Die gesamte Erfahrung von Anfang bis Ende war top. Wir wurden herzlich empfangen, die Getränkekarte ist umfangreich mit griechischen Weinen und Craft Bier. Das Essen hat uns alle begeistert – besonders der Oktopus vom Grill. Chapeau!" },
  { author: "Robert Fuchs", platform: "Google", rating: 4, responded: false, daysAgo: 28, content: "Sehr authentische griechische Küche in Wien! Die Zutaten sind offensichtlich frisch, man schmeckt es sofort. Ich habe den Horiatiki-Salat und Gyros bestellt – beide exzellent. Das Lokal könnte etwas mehr Sitzplätze vertragen, war sehr voll." },
  { author: "Katharina Steiner", platform: "Google", rating: 5, responded: true, daysAgo: 31, content: "Marco's ist DAS Lokal wenn man echtes griechisches Flair in Wien sucht! Die Dekoration ist schön, die Musik angenehm und das Essen einfach outstanding. Ich habe das Tagesmenu probiert und war sehr überrascht welchen Wert man für das Geld bekommt." },
  { author: "Christian Eder", platform: "Booking.com", rating: 4, responded: false, daysAgo: 35, content: "Sehr gutes Mittagsmenü! Für Wien-Besucher ein absoluter Tipp. Zentrale Lage, faire Preise für die Qualität und freundliches Personal. Die Vorspeisen-Kombi hat uns sehr gut gefallen. Wir kommen nächsten Monat wieder wenn wir in Wien sind." },
  { author: "Sabine Koch", platform: "Google", rating: 5, responded: false, daysAgo: 38, content: "Hier stimmt einfach alles: Atmosphäre, Service, Qualität und Preis-Leistung. Das Souvlaki-Set für zwei war perfekt zum Teilen. Dazu einen Hauswein und wir hatten einen wunderschönen Abend. Marco ist ein toller Gastgeber!" },
  { author: "Florian Berger", platform: "Google", rating: 3, responded: true, daysAgo: 42, content: "Solides griechisches Restaurant, nicht mehr nicht weniger. Das Essen war gut aber ich habe schon Besseres gegessen. Service war etwas unaufmerksam, mussten zweimal nach der Rechnung fragen. Würde es einem Freund empfehlen aber nicht als Top-Empfehlung." },
  { author: "Nicole Winkler", platform: "Tripadvisor", rating: 5, responded: false, daysAgo: 45, content: "Absolut authentisch und frisch! Wir kommen aus Griechenland und waren sehr beeindruckt – das schmeckt wie zu Hause. Marco hat sogar griechisch mit uns gesprochen! Die Portionen sind großzügig, das Preis-Leistungs-Verhältnis stimmt. 10/10!" },
  { author: "Andreas Zimmermann", platform: "Google", rating: 4, responded: true, daysAgo: 50, content: "Top Essen in entspannter Atmosphäre. Besonders die Mezze-Platte zum Teilen ist eine Empfehlung wert – so kann man viele verschiedene Gerichte probieren. Wein aus Santorini war eine tolle Entdeckung. Nächstes Mal reservieren wir früher!" },
  { author: "Monika Pichler", platform: "Facebook", rating: 5, responded: false, daysAgo: 55, content: "Unfassbar gutes Essen! Ich bin veganer und hatte trotzdem eine riesige Auswahl – das passiert mir in Wien selten. Die gebackenen Auberginen und der Hummus sind weltklasse. Der Service hat mich extra auf vegane Optionen hingewiesen ohne dass ich fragen musste. Danke!" },
  { author: "Dominik Kraus", platform: "Google", rating: 5, responded: true, daysAgo: 60, content: "Marco's ist seit 2 Jahren unser Lieblingsrestaurant in Wien. Die Qualität bleibt konstant hoch und das Personal kennt uns mittlerweile beim Namen. Das Lammfleisch ist immer perfekt zubereitet. Danke für die vielen tollen Abende!" },
  { author: "Eva Schneider", platform: "Google", rating: 4, responded: false, daysAgo: 65, content: "Sehr empfehlenswert! Gute Qualität, faire Preise und nettes Personal. Das Lokal ist etwas klein und man sitzt relativ nah beieinander – für manche vielleicht zu eng. Aber das Essen macht das absolut wett. Gyros war perfekt würzig!" },
];

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

    // Insert business
    const { data: existing } = await supabase
      .from("businesses")
      .select("id")
      .eq("user_id", user.id)
      .eq("name", "Marco's Fresh Greek")
      .maybeSingle();

    if (!existing) {
      await supabase.from("businesses").insert({
        user_id: user.id,
        name: "Marco's Fresh Greek",
        address: "Landstraßer Hauptstraße 73, 1030 Wien",
        phone: "+43 1 2864909",
        google_maps_url: "https://www.google.com/maps/place/Marco's+Fresh+Greek/@48.2013,16.3897,17z",
        google_review_url: "https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsedpd-_nqo",
      });
    }

    // Clear existing demo reviews to avoid duplicates
    await supabase.from("reviews").delete().eq("user_id", user.id);

    // Insert reviews
    const now = new Date();
    const rows = REVIEWS.map((r) => {
      const d = new Date(now);
      d.setDate(d.getDate() - r.daysAgo);
      return {
        user_id: user.id,
        author_name: r.author,
        platform: r.platform,
        rating: r.rating,
        content: r.content,
        responded: r.responded,
        created_at: d.toISOString(),
      };
    });

    const { error } = await supabase.from("reviews").insert(rows);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true, count: rows.length });
  } catch (e) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
