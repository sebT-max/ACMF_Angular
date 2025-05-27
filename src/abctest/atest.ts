//inscription-create.hmtl
<div class="checkbox_register">
<input id="acceptTerms" type="checkbox" formControlName="acceptTerms" />
  <p>
    Acceptez nos
<a href="#" (click)="goToConditions($event)" style="text-decoration: underline;color:red;">
  Conditions d'utilisation et notre Politique de confidentialité
</a>
</p>
</div>

<div *ngIf="inscriptionCreationForm.get('acceptTerms')?.invalid && inscriptionCreationForm.get('acceptTerms')?.touched" class="error-message">
  Vous devez accepter les conditions pour continuer.
</div>

}

// Dans le formulaire d'inscription au stage, Initialiser le formulaire avec les valeurs par défaut

//inscription-create.ts
this.inscriptionCreationForm = this._fb.group({
  user: this._fb.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    otherNames: [''],
    birthdate: ['', Validators.required],
    birthplace: [''],
    streetAndNumber: [''],
    zipCode: [''],
    city: [''],
    email: ['', [Validators.required, Validators.email]],
    telephone: ['', Validators.required],
    password: ['', Validators.required],
  }),
  stageId: [this.stageId, Validators.required],
  stageType: ['', Validators.required],
  inscriptionStatut: ['EN_ATTENTE', Validators.required],
  codePromo: [''],
  acceptTerms: [false, Validators.requiredTrue] // Valeur par défaut, sera remplacée si sauvegarde trouvée
});
// Restaurer depuis le localStorage
const savedForm = localStorage.getItem('inscriptionForm');
if (savedForm) {
  try {
    const parsed = JSON.parse(savedForm);
    this.inscriptionCreationForm.patchValue(parsed);
  } catch (error) {
    console.error("Erreur lors de la restauration du formulaire :", error);
    localStorage.removeItem('inscriptionForm');
  }
}

// Sauvegarder à chaque changement
this.inscriptionCreationForm.valueChanges.subscribe(value => {
  localStorage.setItem('inscriptionForm', JSON.stringify(value));
});

// Restaurer depuis le localStorage
const savedForm = localStorage.getItem('inscriptionForm');
if (savedForm) {
  try {
    const parsed = JSON.parse(savedForm);
    this.inscriptionCreationForm.patchValue(parsed);
  } catch (error) {
    console.error("Erreur lors de la restauration du formulaire :", error);
    localStorage.removeItem('inscriptionForm');
  }
}
goToConditions(event: Event) {
  event.preventDefault();
  localStorage.setItem('inscriptionForm', JSON.stringify(this.inscriptionCreationForm.value));
  const currentUrl = this.router.url;
  this.router.navigate(['/conditions-generales-vente'], {
    queryParams: { redirect: encodeURIComponent(currentUrl) }
  });

//Pour l'instant,ce qui se passe, c'est que quand je suis dans inscription-create.hmtl, je remplis mes champs user et autrespour
// Pour l'acceptTerms, je clique sur un lien qui m'amène vers une page ou je peux lire des conditions générales.
//Au bout du fichier, j'ai deux boutons,'

  //conditions-generales-de-vente.html
<p>* À cocher pendant le processus d'inscription</p>
<br/>


<br />
<button class="see_all_button journey_catalogue_button" (click)="returnWithConsent()">J'accepte</button>
<button  class="see_all_button journey_catalogue_button" (click)="returnWithoutConsent()">🚫 Retour sans accord</button>

//Ca c'est mon composant conditions générales de vente
export class ConditionsGeneralesDeVenteComponent {
  accepted = false;

  constructor(private router: Router, private route: ActivatedRoute,private location: Location) {}

  returnWithConsent() {
    localStorage.setItem('acceptTerms', 'true');
    this.returnToPrevious();
  }

  returnWithoutConsent() {
    localStorage.setItem('acceptTerms', 'false');
    this.returnToPrevious();
  }

  private returnToPrevious() {

    const redirect = this.route.snapshot.queryParamMap.get('redirect') || '/register';
    this.router.navigateByUrl(decodeURIComponent(redirect));
  }
}

//Quand je clique sur le bouton qui utilise la méthode returnWithConsent,
//Ca me renvoie à inscription-createle checkbox d'acceptations des termes .
//Le problème c'est que la case devrait normalement être coché
