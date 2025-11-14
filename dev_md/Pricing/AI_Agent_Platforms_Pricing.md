# AI Agent Platforms Pricing (CLI-Friendly Summary)

> Note: All prices and limits are indicative only and may change. Always confirm on the official pricing pages before purchase.

---

## botpress

### meta

- provider: Botpress
- url: https://www.botpress.com/ko/pricing
- pricing_model: subscription + usage_based
- llm_cost: pass-through (external LLM provider cost, no Botpress markup)
- monthly_ai_credit_per_workspace_usd: 5
- workspace_spending_limit: configurable

### plans

#### plan: usage_based

- name: Usage-based (Free / Pay-as-you-go)
- monthly_fee_usd: 0
- ai_usage_billing: external LLM usage only
- bots_included: 1
- collaborators_included: 1
- messages_and_events_included_per_month: 500
- table_rows_included: 1000
- vector_db_storage_included_mb: 100
- file_storage_included_mb: 100
- always_alive_included: 0
- support: community (forum, docs, Discord)
- watermark_removed: false

#### plan: plus

- name: Plus
- monthly_fee_usd: 89
- ai_usage_billing: external LLM usage only
- bots_included: 2
- collaborators_included: 2
- messages_and_events_included_per_month: 5000
- table_rows_included: 100000
- vector_db_storage_included_gb: 1
- file_storage_included_gb: 10
- always_alive_included: 1
- features:
  - visual building studio
  - active chat bubble
  - visual KB indexing
  - agent handoff to human
  - conversation insights
  - remove "Powered by Botpress" branding
  - live chat support

#### plan: team

- name: Team
- monthly_fee_usd: 495
- ai_usage_billing: external LLM usage only
- bots_included: 3
- collaborators_included: 3
- messages_and_events_included_per_month: 50000
- table_rows_included: 100000
- vector_db_storage_included_gb: 2
- file_storage_included_gb: 10
- always_alive_included: 3
- features:
  - all_plus_features: true
  - role_based_access_control: true
  - real_time_collaboration: true
  - custom_analytics_dashboards: true
  - advanced_support_with_faster_response: true

#### plan: managed

- name: Managed
- monthly_fee: custom (currency: likely KRW; exact digits require UI check)
- ai_usage_billing: external LLM usage only
- features:
  - all_team_features: true
  - custom_development: true
  - ongoing_maintenance: true
  - integrations_with_existing_systems: true
  - priority_support: true
  - monthly_strategy_sessions: true
  - team_training_sessions: true

#### plan: enterprise

- name: Enterprise
- monthly_fee: custom (contact_sales)
- ai_usage_billing: external LLM usage only
- features:
  - all_team_features: true
  - customized_workspace_limits: true
  - dedicated_customer_success_manager: true
  - custom_onboarding: true

### addons

#### addon: messages_and_events

- included_per_plan:
  - usage_based: 500
  - plus: 5000
  - team: 50000
- extra_pricing_usd:
  - unit: 5000_messages_or_events_per_month
  - price_per_unit_usd_per_month: 20

#### addon: table_rows

- included_per_plan:
  - usage_based: 1000
  - plus: 100000
  - team: 100000
- extra_pricing_usd:
  - unit: 100000_rows
  - price_per_unit_usd_per_month: 25

#### addon: bots

- included_per_plan:
  - usage_based: 1
  - plus: 2
  - team: 3
- extra_pricing_usd:
  - unit: 1_bot
  - price_per_unit_usd_per_month: 10

#### addon: always_alive

- included_per_plan:
  - usage_based: 0
  - plus: 1
  - team: 3
- extra_pricing_usd:
  - unit: 1_always_alive_bot
  - price_per_unit_usd_per_month: 10

#### addon: collaborators

- included_per_plan:
  - usage_based: 1
  - plus: 2
  - team: 3
- extra_pricing_usd:
  - unit: 1_seat
  - price_per_unit_usd_per_month: 25

#### addon: vector_db_storage

- included_per_plan:
  - usage_based_mb: 100
  - plus_gb: 1
  - team_gb: 2
- extra_pricing_usd:
  - unit: 1_gb
  - price_per_unit_usd_per_month: 20

#### addon: file_storage

- included_per_plan:
  - usage_based_mb: 100
  - plus_gb: 10
  - team_gb: 10
- extra_pricing_usd:
  - unit: 10_gb
  - price_per_unit_usd_per_month: 10

---

## dify

### meta

- provider: Dify
- url: https://dify.ai/pricing#plans-and-features
- product: Dify Cloud
- self_hosting: available (pricing not published on page)
- special_programs:
  - students_and_educators_free: true

### plans

#### plan: sandbox

- name: Sandbox
- monthly_fee_usd: 0
- message_credits_per_month: 200
- team_workspaces_limit: 1
- team_members_limit: 1
- apps_limit: 5
- knowledge_documents_limit: 50
- knowledge_storage_mb: 50
- knowledge_request_rate_per_min: 10
- api_rate_limit_per_day: 5000
- annotation_quota: 10
- log_history_days: 30
- llm_providers_supported:
  - OpenAI
  - Anthropic
  - Llama2
  - Azure_OpenAI
  - Hugging_Face
  - Replicate

#### plan: professional

- name: Professional
- monthly_fee_usd: 59
- annual_fee_usd: 590 (approx; verify on UI)
- message_credits_per_month: 5000
- team_workspaces_limit: 1
- team_members_limit: 3
- apps_limit: 50
- knowledge_documents_limit: 500
- knowledge_storage_gb: 5
- knowledge_request_rate_per_min: 100
- api_rate_limit: unlimited
- annotation_quota: 2000
- log_history: unlimited
- document_processing_priority: priority
- llm_providers_supported:
  - OpenAI
  - Anthropic
  - Llama2
  - Azure_OpenAI
  - Hugging_Face
  - Replicate

#### plan: team

- name: Team
- monthly_fee_usd: 159
- annual_fee_usd: unknown (scraped text ambiguous; likely around 1590; verify on UI)
- message_credits_per_month: 10000
- team_workspaces_limit: 1
- team_members_limit: 50
- apps_limit: 200
- knowledge_documents_limit: 1000
- knowledge_storage_gb: 20
- knowledge_request_rate_per_min: 1000
- api_rate_limit: unlimited
- annotation_quota: 5000
- log_history: unlimited
- document_processing_priority: top_priority
- llm_providers_supported:
  - OpenAI
  - Anthropic
  - Llama2
  - Azure_OpenAI
  - Hugging_Face
  - Replicate

---

## deepset

### meta

- provider: deepset
- url: https://www.deepset.ai/pricing
- product: deepset Studio / deepset Enterprise
- pricing_model: free_tier + enterprise_custom

### plans

#### plan: studio

- name: Studio
- monthly_fee_usd: 0
- target_users: individuals_or_small_teams_for_prototyping
- workspaces_limit: 1
- users_limit: 1
- pipeline_hours_limit: 100
- files_limit: 50
- file_size_limit_mb: 10
- development_pipelines_limit: 2
- production_pipelines_limit: 0
- deployment_options:
  - cloud: true
  - custom_deployment: false
- support:
  - discord_community: true
  - dedicated_support: false
- observability:
  - logs_retention_days: 14
  - search_history_retention_days: 14
- uptime_credits_limit: 100

#### plan: enterprise

- name: Enterprise
- monthly_fee: custom (contact_sales)
- target_users: teams_building_production_ai_apps
- workspaces_limit: unlimited
- users_limit: unlimited
- pipeline_hours_limit: unlimited
- files_limit: unlimited
- file_size_limit: not_limited_by_pricing_page
- development_pipelines_limit: unlimited
- production_pipelines_limit: unlimited_high_availability
- deployment_options:
  - cloud: true
  - custom_deployment: true
- support:
  - dedicated_account_team: true
  - solution_engineers: true
  - private_slack_channel: true
- security_and_access:
  - sso: true
  - role_based_access_control: true
- observability_and_uptime:
  - production_ready_sla: true
  - advanced_observability_features: true

---

## contextual_ai

### meta

- provider: Contextual AI
- url: https://contextual.ai/pricing
- product: Contextual Platform + Component APIs
- pricing_model: usage_based (on_demand) + provisioned_throughput

### platform_plans

#### plan: on_demand

- name: On-demand
- billing_type: pay_as_you_go
- free_trial_credits_usd: 25
- query_pricing:
  - approx_price_per_query_usd: 0.05
  - actual_price_basis: processed_tokens
- document_ingestion_pricing:
  - price_usd_per_1000_pages: 48.5
- limits:
  - workspaces: unlimited
  - users: unlimited
  - agents: unlimited
  - datastores: unlimited
- features:
  - ui_data_ingestion: true
  - standard_data_retention: true
  - some_enterprise_features_disabled: true (see provisioned plan)

#### plan: provisioned_throughput

- name: Provisioned Throughput
- billing_type: monthly_commitment
- price: custom (contact_sales)
- model_units:
  - description: fixed_capacity_units_with_guaranteed_tps
- use_case: predictable_high_throughput_production_workloads
- features:
  - guaranteed_tps: true
  - sso: true
  - rbac: true
  - usage_analytics: true
  - pipeline_observability: true
  - uptime_sla: true
  - continuous_data_ingestion: true
  - custom_data_retention: true
  - more_data_integrations: true

### component_apis_pricing

#### component: parse

- basic_tier:
  - description: text_only_parsing
  - price_usd_per_1000_pages: 3
- standard_tier:
  - description: multimodal_parsing (charts, images, etc.)
  - price_usd_per_1000_pages: 40

#### component: rerank

- model: rerank_v2
  - price_usd_per_1m_tokens: 0.05
- model: rerank_v2_mini
  - price_usd_per_1m_tokens: 0.02

#### component: generate

- description: generative_llm
- pricing:
  - input_tokens_price_usd_per_1m: 3
  - output_tokens_price_usd_per_1m: 15

#### component: lmunit

- description: evaluation_llm_for_metrics
- pricing:
  - input_tokens_price_usd_per_1m: 3
  - output_tokens_price_usd_per_1m: not_specified_on_page

---

## n8n

### meta

- provider: n8n
- url: https://n8n.io/pricing/
- product: n8n Cloud + n8n Self-host
- pricing_model: monthly_executions_based
- currency: EUR
- users_per_plan: unlimited
- workflows_per_plan: unlimited

### cloud_plans (annual_billing_prices_per_month)

#### plan: starter

- name: Starter
- monthly_fee_eur_annual_billing: 20
- executions_included_per_month: 2500
- shared_projects_limit: 1
- concurrent_executions_limit: 5
- ai_workflow_builder_credits: 50
- insights:
  - lookback_range: up_to_7_days
- features:
  - unlimited_users: true
  - unlimited_workflows: true
  - all_integrations_included: true
  - forum_support: true

#### plan: pro

- name: Pro
- monthly_fee_eur_annual_billing: 50
- executions_included_per_month: 10000
- shared_projects_limit: 3
- concurrent_executions_limit: 20
- ai_workflow_builder_credits: 150
- insights:
  - lookback_range: up_to_7_or_14_days (more granular than starter)
  - additional_filters_and_breakdowns: true
- admin_features:
  - admin_roles: true
  - global_variables: true
  - workflow_history: true
  - execution_search: true
- features:
  - unlimited_users: true
  - unlimited_workflows: true
  - all_integrations_included: true
  - email_support: true

#### plan: business

- name: Business (self-hosted license)
- monthly_fee_eur_annual_billing: 667
- executions_included_per_month: 40000
- shared_projects_limit: 6
- concurrent_executions_limit: not_clearly_stated (higher_than_pro)
- insights:
  - lookback_range_days: 30
- enterprise_features:
  - sso_saml_ldap: true
  - environments_separation_dev_prod: true
  - git_version_control_for_workflows: true
  - advanced_scaling_options: true
- features:
  - unlimited_users: true
  - unlimited_workflows: true
  - forum_support: true

#### plan: enterprise

- name: Enterprise
- monthly_fee: custom (contact_sales)
- executions_included_per_month: custom
- shared_projects_limit: unlimited
- concurrent_executions_limit: 200_plus
- ai_workflow_builder_credits: 1000
- insights:
  - lookback_range_days: up_to_365
  - extended_data_retention: true
- enterprise_features:
  - external_secret_store: true
  - log_streaming: true
  - extended_data_retention: true
  - sla_uptime_and_support: true
  - invoice_billing: true
- features:
  - unlimited_users: true
  - unlimited_workflows: true

### additional_programs_and_variants

#### free_trial

- free_trial:
  - duration_days: 14
  - available_for_plans:
    - starter: true
    - pro: true
  - includes:
    - all_pro_features: true
    - starter_limits_on_executions_and_concurrency: true

#### startup_plan

- startup_plan:
  - name: Start-up Program
  - discount_on_business_plan_percent: 50
  - eligibility:
    - employees_under_20: true
    - additional_requirements: see_official_docs

#### community_edition

- community_edition:
  - name: Community Edition (self-host)
  - license_fee: 0
  - hosting: self_hosted
  - features: core_n8n_features_without_cloud_services
