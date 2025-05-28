/*




/!*
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
*!/

j'utilise mailtrap

voici mon application.properties

spring.mail.host=sandbox.smtp.mailtrap.io
spring.mail.port=2525
spring.mail.username=c17015d85d90fd
spring.mail.password=5cb0f4246de0b1
spring.mail.protocol=smtp
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=false
spring.mail.default-encoding=UTF-8
logging.level.org.springframework.mail=DEBUG
logging.level.org.springframework.mail.javamail=DEBUG
logging.level.jakarta.mail=DEBUG

package com.example.AutoEcole.bll.serviceImpl;

import com.example.AutoEcole.bll.service.EmailService;
import com.example.AutoEcole.bll.service.PasswordResetService;
import com.example.AutoEcole.dal.domain.entity.PasswordResetToken;
import com.example.AutoEcole.dal.domain.entity.User;
import com.example.AutoEcole.dal.repository.PasswordResetTokenRepository;
import com.example.AutoEcole.dal.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetServiceImpl implements PasswordResetService{

  private final PasswordResetTokenRepository tokenRepository;
  private final UserRepository userRepository;
  private final EmailService emailService; // Un service d'envoi de mails
  private final PasswordEncoder passwordEncoder;
  public PasswordResetServiceImpl(PasswordResetTokenRepository tokenRepository, UserRepository userRepository, EmailService emailService, PasswordEncoder passwordEncoder) {
  this.tokenRepository = tokenRepository;
  this.userRepository = userRepository;
  this.emailService = emailService;
  this.passwordEncoder = passwordEncoder;
}

@Override
@Transactional
public void createPasswordResetToken(String email) {
  Optional<User> optionalUser = userRepository.findByEmail(email);
  if (optionalUser.isEmpty()) {
    return;
  }

  User user = optionalUser.get();
  tokenRepository.deleteByUser(user);

  String token = UUID.randomUUID().toString();
  PasswordResetToken resetToken = new PasswordResetToken();
  resetToken.setToken(token);
  resetToken.setUser(user);
  resetToken.setExpiryDate(LocalDateTime.now().plusHours(1));

  tokenRepository.save(resetToken);

  //Dev
  String resetLink = "http://localhost:4200/reset-password?token=" + token;


  //Railway ou prod
  //        String resetLink = "https://test-acf.netlify.app/reset-password?token=" + token;



  // Temporaire : affiche le lien dans les logs
  System.out.println("🔗 Lien de réinitialisation: " + resetLink);

  try {
    emailService.sendPasswordResetEmail(user.getEmail(), resetLink);
    System.out.println("✅ Email envoyé avec succès");
  } catch (Exception e) {
    System.out.println("❌ Erreur envoi email: " + e.getMessage());
    // Pour le développement, on peut continuer même si l'email échoue
  }
}
@Override
public boolean resetPassword(String token, String newPassword) {
  Optional<PasswordResetToken> optionalToken = tokenRepository.findByToken(token);
  if (optionalToken.isEmpty()) {
    return false;
  }

  PasswordResetToken resetToken = optionalToken.get();

  if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
    return false;
  }

  User user = resetToken.getUser();
  user.setPassword(passwordEncoder.encode(newPassword));
  userRepository.save(user);

  tokenRepository.delete(resetToken); // ou le marquer comme utilisé

  return true;
}
}

package com.example.AutoEcole.bll.serviceImpl;

import com.example.AutoEcole.bll.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;


@RequiredArgsConstructor
@Service
public class EmailServiceImpl implements EmailService {

  private final JavaMailSender mailSender;

  @Override
  public void sendPasswordResetEmail(String to, String resetLink) {
  try {
  MimeMessage message = mailSender.createMimeMessage();
  // true = multipart message
  MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");

  helper.setFrom("noreply@autoecole.com");
  helper.setTo(to);
  helper.setSubject("Réinitialisation de votre mot de passe");

  // Texte simple, tu peux mettre du HTML en remplaçant false par true
  String text = "Cliquez sur ce lien pour réinitialiser votre mot de passe : " + resetLink;
  helper.setText(text, false);

  mailSender.send(message);
  System.out.println("✅ Email envoyé avec succès à: " + to);

} catch (MessagingException e) {
  System.out.println("❌ Erreur envoi email: " + e.getMessage());
  e.printStackTrace();
  throw new RuntimeException("Erreur lors de l'envoi de l'email", e);
}
}
}


@PostMapping("/forgot-password")
public ResponseEntity<?> forgotPassword(@RequestParam String email) {
  try {
    passwordResetService.createPasswordResetToken(email);
  } catch (Exception e) {
    // Log l'erreur mais ne la révèle pas à l'utilisateur
    System.out.println("🔥🔥🔥 Erreur lors de la création du token de reset: " + e.getMessage());
    e.printStackTrace();
  }

  // Retourne toujours la même réponse pour éviter les fuites d'info
  Map<String, String> response = new HashMap<>();
  response.put("message", "Si cet email est enregistré, un lien de réinitialisation vous a été envoyé.");

  return ResponseEntity.ok(response);
}


*/
