import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Autocomplete,
  TextField,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';
import {
  Print as PrintIcon,
  Person as PersonIcon,
  Description as DescriptionIcon,
  Nfc as NfcIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import { utilisateursApi, templatesApi, impressionApi, nfcApi } from '../services/api';

const etapes = ['Sélectionner l\'utilisateur', 'Choisir le template', 'Options NFC', 'Confirmer et imprimer'];

function PageImpression() {
  const location = useLocation();
  const [etapeActive, setEtapeActive] = useState(0);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [nfcStatus, setNfcStatus] = useState({ disponible: false });
  const [loading, setLoading] = useState(true);
  const [impression, setImpression] = useState(false);

  const [selection, setSelection] = useState({
    utilisateur: null,
    template: null,
    encoderNfc: false,
    donneesNfc: {},
    imprimante: 'Luca 40 KM',
  });

  const [apercu, setApercu] = useState(null);

  useEffect(() => {
    chargerDonnees();
  }, []);

  useEffect(() => {
    // Pré-remplir si utilisateur passé via navigation
    if (location.state?.utilisateur) {
      setSelection((prev) => ({
        ...prev,
        utilisateur: location.state.utilisateur,
      }));
      setEtapeActive(1);
    }
  }, [location.state]);

  const chargerDonnees = async () => {
    setLoading(true);
    try {
      const [utilisateursRes, templatesRes, nfcRes] = await Promise.all([
        utilisateursApi.getAll(),
        templatesApi.getAll(),
        nfcApi.getStatus().catch(() => ({ donnees: { disponible: false } })),
      ]);

      setUtilisateurs(utilisateursRes.donnees || []);
      setTemplates(templatesRes.donnees || []);
      setNfcStatus(nfcRes.donnees || {});
    } catch (error) {
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const handleUtilisateurChange = (event, valeur) => {
    setSelection((prev) => ({ ...prev, utilisateur: valeur }));
    if (valeur) {
      setEtapeActive(1);
    }
  };

  const handleTemplateChange = async (template) => {
    setSelection((prev) => ({ ...prev, template }));

    if (template && selection.utilisateur) {
      // Générer l'aperçu
      try {
        const response = await templatesApi.apercu(template.id, selection.utilisateur);
        setApercu(response.donnees);
      } catch (error) {
        console.error('Erreur aperçu:', error);
      }
    }

    setEtapeActive(2);
  };

  const handleNfcChange = (event) => {
    setSelection((prev) => ({ ...prev, encoderNfc: event.target.checked }));
  };

  const handleImprimer = async () => {
    if (!selection.utilisateur || !selection.template) {
      toast.error('Veuillez sélectionner un utilisateur et un template');
      return;
    }

    setImpression(true);
    try {
      const response = await impressionApi.imprimer({
        utilisateur_id: selection.utilisateur.id,
        template_id: selection.template.id,
        encoder_nfc: selection.encoderNfc,
        donnees_nfc: selection.encoderNfc
          ? {
              uid: selection.utilisateur.nfc_uid,
              nom: selection.utilisateur.nom,
              prenom: selection.utilisateur.prenom,
              numero_carte: selection.utilisateur.numero_carte,
            }
          : null,
        imprimante: selection.imprimante,
      });

      if (response.succes) {
        toast.success('Impression lancée avec succès !');
        setEtapeActive(4);
      } else {
        toast.error(response.message || 'Erreur lors de l\'impression');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'impression');
    } finally {
      setImpression(false);
    }
  };

  const handleGenererApercu = async () => {
    if (!selection.utilisateur || !selection.template) {
      toast.error('Veuillez sélectionner un utilisateur et un template');
      return;
    }

    try {
      const response = await impressionApi.apercu(
        selection.utilisateur.id,
        selection.template.id
      );

      if (response.succes) {
        window.open(response.donnees.pdf_url, '_blank');
        toast.success('Aperçu PDF généré');
      }
    } catch (error) {
      toast.error('Erreur lors de la génération de l\'aperçu');
    }
  };

  const reinitialiser = () => {
    setSelection({
      utilisateur: null,
      template: null,
      encoderNfc: false,
      donneesNfc: {},
      imprimante: 'Luca 40 KM',
    });
    setApercu(null);
    setEtapeActive(0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Nouvelle Impression
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Sélectionnez un utilisateur et un template pour générer une carte
      </Typography>

      <Grid container spacing={3}>
        {/* Étapes */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Stepper activeStep={etapeActive} orientation="vertical">
                {/* Étape 1: Sélection utilisateur */}
                <Step>
                  <StepLabel
                    StepIconComponent={() => (
                      <PersonIcon color={etapeActive >= 0 ? 'primary' : 'disabled'} />
                    )}
                  >
                    Sélectionner l'utilisateur
                  </StepLabel>
                  <StepContent>
                    <Autocomplete
                      options={utilisateurs}
                      getOptionLabel={(option) =>
                        `${option.prenom} ${option.nom} (${option.numero_carte || 'Sans numéro'})`
                      }
                      value={selection.utilisateur}
                      onChange={handleUtilisateurChange}
                      renderInput={(params) => (
                        <TextField {...params} label="Rechercher un utilisateur" fullWidth />
                      )}
                      sx={{ mt: 2, mb: 2 }}
                    />
                    {selection.utilisateur && (
                      <Alert severity="success" sx={{ mt: 1 }}>
                        Utilisateur sélectionné: {selection.utilisateur.prenom}{' '}
                        {selection.utilisateur.nom}
                      </Alert>
                    )}
                  </StepContent>
                </Step>

                {/* Étape 2: Sélection template */}
                <Step>
                  <StepLabel
                    StepIconComponent={() => (
                      <DescriptionIcon color={etapeActive >= 1 ? 'primary' : 'disabled'} />
                    )}
                  >
                    Choisir le template
                  </StepLabel>
                  <StepContent>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                      {templates.map((template) => (
                        <Grid item xs={12} sm={6} key={template.id}>
                          <Paper
                            sx={{
                              p: 2,
                              cursor: 'pointer',
                              border: 2,
                              borderColor:
                                selection.template?.id === template.id
                                  ? 'primary.main'
                                  : 'transparent',
                              '&:hover': {
                                borderColor: 'primary.light',
                              },
                            }}
                            onClick={() => handleTemplateChange(template)}
                          >
                            <Typography variant="subtitle1" fontWeight="bold">
                              {template.nom}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {template.description || 'Aucune description'}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </StepContent>
                </Step>

                {/* Étape 3: Options NFC */}
                <Step>
                  <StepLabel
                    StepIconComponent={() => (
                      <NfcIcon color={etapeActive >= 2 ? 'primary' : 'disabled'} />
                    )}
                  >
                    Options NFC
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ mt: 2 }}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selection.encoderNfc}
                            onChange={handleNfcChange}
                          />
                        }
                        label="Encoder les données NFC sur la carte"
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
                        Les données de l'utilisateur seront encodées sur la puce NFC de la carte.
                      </Typography>

                      {selection.encoderNfc && (
                        <Alert severity="info" sx={{ mt: 2 }}>
                          <Typography variant="body2">
                            <strong>Données à encoder:</strong>
                          </Typography>
                          <Typography variant="body2">
                            • Nom: {selection.utilisateur?.nom}
                          </Typography>
                          <Typography variant="body2">
                            • Prénom: {selection.utilisateur?.prenom}
                          </Typography>
                          <Typography variant="body2">
                            • N° Carte: {selection.utilisateur?.numero_carte || 'Non défini'}
                          </Typography>
                        </Alert>
                      )}

                      <Alert
                        severity={nfcStatus.connecte ? 'success' : 'warning'}
                        sx={{ mt: 2 }}
                      >
                        {nfcStatus.connecte
                          ? 'Lecteur NFC connecté et prêt'
                          : 'Mode simulation NFC actif (lecteur non détecté)'}
                      </Alert>

                      <Button
                        variant="outlined"
                        onClick={() => setEtapeActive(3)}
                        sx={{ mt: 2 }}
                      >
                        Continuer
                      </Button>
                    </Box>
                  </StepContent>
                </Step>

                {/* Étape 4: Confirmation */}
                <Step>
                  <StepLabel
                    StepIconComponent={() => (
                      <PrintIcon color={etapeActive >= 3 ? 'primary' : 'disabled'} />
                    )}
                  >
                    Confirmer et imprimer
                  </StepLabel>
                  <StepContent>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body1" gutterBottom>
                        <strong>Récapitulatif:</strong>
                      </Typography>
                      <Typography variant="body2">
                        • Utilisateur: {selection.utilisateur?.prenom} {selection.utilisateur?.nom}
                      </Typography>
                      <Typography variant="body2">
                        • Template: {selection.template?.nom}
                      </Typography>
                      <Typography variant="body2">
                        • Encodage NFC: {selection.encoderNfc ? 'Oui' : 'Non'}
                      </Typography>
                      <Typography variant="body2">
                        • Imprimante: {selection.imprimante}
                      </Typography>

                      <Divider sx={{ my: 2 }} />

                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="outlined"
                          onClick={handleGenererApercu}
                        >
                          Aperçu PDF
                        </Button>
                        <Button
                          variant="contained"
                          startIcon={impression ? <CircularProgress size={20} /> : <PrintIcon />}
                          onClick={handleImprimer}
                          disabled={impression}
                        >
                          {impression ? 'Impression en cours...' : 'Lancer l\'impression'}
                        </Button>
                      </Box>
                    </Box>
                  </StepContent>
                </Step>
              </Stepper>

              {etapeActive === 4 && (
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main' }} />
                  <Typography variant="h6" color="success.main" sx={{ mt: 2 }}>
                    Impression lancée avec succès !
                  </Typography>
                  <Button variant="outlined" onClick={reinitialiser} sx={{ mt: 2 }}>
                    Nouvelle impression
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Aperçu */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Aperçu de la carte
              </Typography>

              {apercu ? (
                <Box
                  sx={{
                    border: '1px solid #ccc',
                    borderRadius: 2,
                    overflow: 'hidden',
                    backgroundColor: '#f5f5f5',
                    p: 2,
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      aspectRatio: '85.6 / 53.98',
                      backgroundColor: 'white',
                      borderRadius: 1,
                      overflow: 'hidden',
                      boxShadow: 2,
                    }}
                    dangerouslySetInnerHTML={{ __html: apercu.html_recto }}
                  />

                  {apercu.html_verso && (
                    <>
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', textAlign: 'center', my: 1 }}
                      >
                        Verso
                      </Typography>
                      <Box
                        sx={{
                          width: '100%',
                          aspectRatio: '85.6 / 53.98',
                          backgroundColor: 'white',
                          borderRadius: 1,
                          overflow: 'hidden',
                          boxShadow: 2,
                        }}
                        dangerouslySetInnerHTML={{ __html: apercu.html_verso }}
                      />
                    </>
                  )}
                </Box>
              ) : (
                <Box
                  sx={{
                    width: '100%',
                    aspectRatio: '85.6 / 53.98',
                    backgroundColor: '#f0f0f0',
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px dashed #ccc',
                  }}
                >
                  <Typography color="text.secondary">
                    Sélectionnez un utilisateur et un template
                  </Typography>
                </Box>
              )}

              {selection.utilisateur && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Données de l'utilisateur
                  </Typography>
                  <Typography variant="body2">
                    <strong>Nom:</strong> {selection.utilisateur.nom}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Prénom:</strong> {selection.utilisateur.prenom}
                  </Typography>
                  {selection.utilisateur.numero_carte && (
                    <Typography variant="body2">
                      <strong>N° Carte:</strong> {selection.utilisateur.numero_carte}
                    </Typography>
                  )}
                  {selection.utilisateur.email && (
                    <Typography variant="body2">
                      <strong>Email:</strong> {selection.utilisateur.email}
                    </Typography>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

export default PageImpression;
