import { Calendar } from "lucide-react";
import { Widget } from "../Widget";
import { EmptyState } from "../EmptyState";

export function AgendaWidget() {
  return (
    <Widget icon={Calendar} title="Agenda du jour" caption="Aujourd'hui — UTC">
      <EmptyState
        icon={Calendar}
        title="Calendrier non câblé"
        description="Le collecteur Google Calendar sera activé dans une itération dédiée. L'agenda du jour apparaîtra ici dès que la source sera connectée."
        pastille="Source non câblée"
      />
    </Widget>
  );
}
