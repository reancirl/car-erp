<?php

return [
    'allowed_types' => [
        'proof_of_payment',
        'or_cr_scan',
        'financing_contract',
        'insurance_policy',
        'delivery_receipt',
        'lto_doc',
        'doe_approval',
        'spec_sheet',
        'signature_photo',
        'signed_letter',
    ],
    'max_size_kb' => 10 * 1024, // 10 MB
    'allowed_mimes' => [
        'application/pdf',
        'image/jpeg',
        'image/png',
    ],
];
