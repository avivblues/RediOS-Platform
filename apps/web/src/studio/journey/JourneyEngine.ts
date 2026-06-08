import type { ApplicationDefinition, EntityDefinition, MetadataDefinition } from '@redios/shared';
import type { MetadataDebugTree } from '../../core/api/metadata-client';
import { humanizeCode } from '../humanizer/HumanizerEngine';
import type { JourneyDefinition, JourneyNextAction, JourneySource, JourneyStepDefinition } from './JourneyDefinition';

export function createApplicationJourney(source: JourneySource): JourneyDefinition {
  const app = source.application?.definition;
  const appName = app?.name || humanizeCode(app?.code ?? 'NEW_APPLICATION');
  const appEntities = app ? source.entities.filter((entity) => app.entityCodes.includes(entity.code)) : [];
  const dataReady = appEntities.length > 0;
  const informationReady = appEntities.some((entity) => entity.fieldCodes.length > 0);
  const screenReady = source.tree.forms.length > 0 || source.tree.ui.length > 0 || source.tree.views.length > 0;
  const processReady = appEntities.some((entity) => Boolean(entity.workflowCode)) || source.tree.workflows.length > 0;
  const permissionReady = source.tree.securityPolicies.length > 0;
  const reviewReady = dataReady && informationReady && screenReady;
  const launched = Boolean(source.launched || app?.enabled);
  const firstEntity = appEntities[0]?.code ?? source.tree.entities[0] ?? 'DATA_OBJECT';
  const firstForm = source.tree.forms[0] ?? firstEntity;

  const steps: JourneyStepDefinition[] = [
    {
      id: 'IDEA',
      label: 'Aplikasi dibuat',
      description: 'Nama dan tujuan aplikasi sudah jelas.',
      complete: Boolean(app),
      required: true,
      selection: { type: app ? 'APPLICATION_BUILDER' : 'CREATE_APPLICATION', code: app?.code ?? 'CREATE_APPLICATION' },
    },
    {
      id: 'DATA_MODEL',
      label: 'Data dibuat',
      description: 'Data yang dikelola aplikasi sudah didefinisikan.',
      complete: dataReady,
      required: true,
      selection: { type: dataReady ? 'ENTITY' : 'CREATE_APPLICATION', code: firstEntity },
    },
    {
      id: 'SCREEN_DESIGN',
      label: 'Informasi dan layar siap',
      description: 'Informasi sudah ditambahkan dan layar pengguna sudah tersedia.',
      complete: informationReady && screenReady,
      required: true,
      selection: { type: screenReady ? 'FORMS' : 'CREATE_APPLICATION', code: firstForm },
    },
    {
      id: 'PROCESS',
      label: 'Proses',
      description: 'Alur kerja bisnis bisa ditambahkan jika dibutuhkan.',
      complete: processReady,
      required: false,
      selection: { type: 'WORKFLOWS', code: source.tree.workflows[0] ?? 'WORKFLOWS' },
    },
    {
      id: 'SECURITY',
      label: 'Izin akses',
      description: 'Atur siapa yang dapat melihat atau mengubah aplikasi.',
      complete: permissionReady,
      required: false,
      selection: { type: 'SECURITY', code: source.tree.securityPolicies[0] ?? 'SECURITY' },
    },
    {
      id: 'REVIEW',
      label: 'Pemeriksaan',
      description: 'Pastikan data, informasi, dan layar sudah siap sebelum launch.',
      complete: reviewReady,
      required: true,
      selection: { type: app ? 'APPLICATION_BUILDER' : 'CREATE_APPLICATION', code: app?.code ?? 'CREATE_APPLICATION' },
    },
    {
      id: 'LAUNCHED',
      label: 'Launch',
      description: 'Aplikasi sudah aktif dan siap digunakan.',
      complete: launched,
      required: true,
      selection: { type: 'RUNTIME', code: 'RUNTIME' },
    },
  ];

  return {
    applicationName: appName,
    stage: firstIncompleteStage(steps),
    readiness: journeyReadiness(steps),
    steps,
    nextAction: nextBestAction({ app, dataReady, informationReady, screenReady, processReady, permissionReady, launched, tree: source.tree, firstEntity }),
  };
}

export function createStarterJourney(templateName: string): JourneyDefinition {
  const steps: JourneyStepDefinition[] = [
    starterStep('IDEA', 'Pilih ide aplikasi', 'Mulai dari kebutuhan bisnis yang ingin dibuat.', true),
    starterStep('DATA_MODEL', 'Buat data pertama', 'Ceritakan data yang akan dikelola aplikasi.', false),
    starterStep('SCREEN_DESIGN', 'Buat layar', 'Buat layar agar pengguna bisa bekerja.', false),
    starterStep('PROCESS', 'Tambahkan proses', 'Tambahkan alur kerja jika dibutuhkan.', false, false),
    starterStep('SECURITY', 'Atur izin akses', 'Tentukan siapa yang boleh memakai aplikasi.', false, false),
    starterStep('REVIEW', 'Periksa kesiapan', 'Pastikan semua bagian penting sudah siap.', false),
    starterStep('LAUNCHED', 'Launch', 'Aktifkan aplikasi untuk pengguna.', false),
  ];

  return {
    applicationName: templateName,
    stage: 'DATA_MODEL',
    readiness: journeyReadiness(steps),
    steps,
    nextAction: {
      title: `Bagus, ${templateName} sudah dipilih.`,
      description: 'Sekarang beri tahu RediOS data apa yang ingin kamu kelola.',
      buttonLabel: 'Buat Data Object',
      selection: { type: 'CREATE_APPLICATION', code: 'CREATE_APPLICATION' },
      tips: ['Contoh data: Product, Customer, Asset', 'Mulai dari satu data dulu agar mudah dipahami.'],
    },
  };
}

function starterStep(id: JourneyStepDefinition['id'], label: string, description: string, complete: boolean, required = true): JourneyStepDefinition {
  return {
    id,
    label,
    description,
    complete,
    required,
    selection: { type: 'CREATE_APPLICATION', code: 'CREATE_APPLICATION' },
  };
}

function journeyReadiness(steps: JourneyStepDefinition[]): number {
  const requiredSteps = steps.filter((step) => step.required);
  return Math.round((requiredSteps.filter((step) => step.complete).length / requiredSteps.length) * 100);
}

function firstIncompleteStage(steps: JourneyStepDefinition[]): JourneyDefinition['stage'] {
  return steps.find((step) => step.required && !step.complete)?.id ?? 'LAUNCHED';
}

function nextBestAction({
  app,
  dataReady,
  informationReady,
  screenReady,
  processReady,
  permissionReady,
  launched,
  tree,
  firstEntity,
}: {
  app?: ApplicationDefinition;
  dataReady: boolean;
  informationReady: boolean;
  screenReady: boolean;
  processReady: boolean;
  permissionReady: boolean;
  launched: boolean;
  tree: MetadataDebugTree;
  firstEntity: string;
}): JourneyNextAction {
  if (!app) {
    return {
      title: 'Mulai dari aplikasi baru.',
      description: 'Pilih template atau mulai kosong agar RediOS membuat rancangan aplikasi.',
      buttonLabel: 'Buat Aplikasi',
      selection: { type: 'CREATE_APPLICATION', code: 'CREATE_APPLICATION' },
      tips: ['Inventory cocok untuk produk dan stok.', 'Start Blank cocok jika proses bisnis masih unik.'],
    };
  }

  if (!dataReady) {
    return {
      title: 'Bagus, aplikasimu sudah dibuat.',
      description: 'Sekarang beri tahu RediOS data apa yang dikelola aplikasi ini.',
      buttonLabel: 'Buat Data Object',
      selection: { type: 'CREATE_APPLICATION', code: 'CREATE_APPLICATION' },
      tips: ['Contoh: Product, Customer, Asset', 'Gunakan nama yang dipahami pengguna bisnis.'],
    };
  }

  if (!informationReady) {
    return {
      title: `Sekarang jelaskan ${humanizeCode(firstEntity)}.`,
      description: 'Tambahkan informasi agar pengguna tahu detail apa yang harus diisi.',
      buttonLabel: 'Tambah Informasi',
      selection: { type: 'ENTITY', code: firstEntity },
      tips: ['Inventory umum: SKU, Stock, Location', 'Customer umum: Name, Email, Phone'],
    };
  }

  if (!screenReady) {
    return {
      title: 'Buat layar agar pengguna bisa bekerja.',
      description: 'RediOS dapat membuat layar input dan daftar dari informasi yang sudah kamu isi.',
      buttonLabel: 'Buat Layar',
      selection: { type: 'FORMS', code: tree.forms[0] ?? firstEntity },
      tips: ['Layar input dipakai untuk tambah dan edit data.', 'Layar daftar membantu pengguna melihat data.'],
    };
  }

  if (!processReady) {
    return {
      title: 'Tambahkan proses jika ada alur kerja.',
      description: 'Gunakan proses untuk approval, perubahan status, atau tahapan kerja.',
      buttonLabel: 'Atur Proses',
      selection: { type: 'WORKFLOWS', code: tree.workflows[0] ?? 'WORKFLOWS' },
      tips: ['Proses bisa ditambahkan nanti.', 'Contoh: Draft, Approval, Done.'],
    };
  }

  if (!permissionReady) {
    return {
      title: 'Lengkapi izin akses.',
      description: 'Atur siapa yang boleh melihat, mengubah, dan menjalankan aplikasi.',
      buttonLabel: 'Atur Izin Akses',
      selection: { type: 'SECURITY', code: tree.securityPolicies[0] ?? 'SECURITY' },
      tips: ['Mulai dari role pengguna utama.', 'Batasi akses untuk data sensitif.'],
    };
  }

  if (!launched) {
    return {
      title: 'Aplikasi siap diluncurkan.',
      description: 'Periksa preview, lalu launch agar aplikasi bisa digunakan.',
      buttonLabel: 'Launch Application',
      selection: { type: 'RUNTIME', code: 'RUNTIME' },
      tips: ['Pastikan layar utama sudah sesuai.', 'Setelah launch, buka aplikasi untuk mencoba.'],
    };
  }

  return {
    title: 'Aplikasi sudah siap digunakan.',
    description: 'Buka aplikasi untuk mencoba pengalaman pengguna akhir.',
    buttonLabel: 'Open Application',
    selection: { type: 'RUNTIME', code: 'RUNTIME' },
    tips: ['Coba tambah satu record.', 'Kembali ke Studio jika perlu mengubah layar.'],
  };
}
